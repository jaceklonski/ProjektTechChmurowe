import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dueToParam = searchParams.get('due_to');
  const statusParam = searchParams.get('status');
  const priorityParam = searchParams.get('priority');
  const search = searchParams.get('search');
  const orderByField = searchParams.get('orderBy') || 'createdAt';
  const orderDirection = searchParams.get('orderDirection') || 'desc';

  const whereClause = {
    users: {
      some: { email: session.user.email },
    },
  };

  if (dueToParam) {
    const startOfDay = new Date(dueToParam);
    const endOfDay = new Date(dueToParam);
    endOfDay.setHours(23, 59, 59, 999);
    whereClause.due_to = { gte: startOfDay, lte: endOfDay };
  }

  if (statusParam) {
    whereClause.status = statusParam;
  }

  if (priorityParam !== null) {
    whereClause.priority = priorityParam === 'true';
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        users: { select: { id: true, email: true } },
        comments: { include: { user: { select: { id: true, email: true } } } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { [orderByField]: orderDirection },
    });

    const tasksFormatted = tasks.map(task => ({
      ...task,
      due_to: task.due_to ? new Date(task.due_to).toISOString() : null,
    }));

    return NextResponse.json({ tasks: tasksFormatted }, { status: 200 });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, status, priority, due_to, due_time, projectId, assignees } = body;

    if (!title) {
      return NextResponse.json({ error: 'Tytuł jest wymagany.' }, { status: 400 });
    }
    if (priority === undefined) {
      return NextResponse.json({ error: 'Pole "priority" jest wymagane.' }, { status: 400 });
    }
    if (!due_to) {
      return NextResponse.json({ error: 'Pole "due_to" jest wymagane.' }, { status: 400 });
    }

    let dueDateString = due_to;
    if (due_time) {
      dueDateString = `${due_to}T${due_time}:00`;
    }
    const dueDate = new Date(dueDateString);
    if (isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: 'Nieprawidłowy format daty/godziny.' }, { status: 400 });
    }

    if (projectId && assignees && assignees.length > 0) {
      return NextResponse.json(
        { error: 'Nie można jednocześnie przypisywać do projektu i użytkowników.' },
        { status: 400 }
      );
    }

    let connectUsers = [];

    if (assignees && assignees.length > 0) {
      const uniqueEmails = Array.from(new Set(assignees.map((email: string) => email.trim().toLowerCase())));

      const users = await prisma.user.findMany({
        where: {
          email: {
            in: uniqueEmails,
          },
        },
        select: {
          id: true,
          email: true,
        },
      });

      const foundEmails = users.map(user => user.email);
      const notFoundEmails = uniqueEmails.filter(email => !foundEmails.includes(email));

      if (notFoundEmails.length > 0) {
        return NextResponse.json(
          { error: `Nie znaleziono użytkowników z emailami: ${notFoundEmails.join(', ')}` },
          { status: 400 }
        );
      }
      connectUsers = users.map(user => ({ id: user.id }));
    }

    if ((!assignees || assignees.length === 0) && !projectId) {
      const creator = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true },
      });
      if (creator) {
        connectUsers.push({ id: creator.id });
      }
    }

    let projectName = "";
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { users: true },
      });
      if (!project) {
        return NextResponse.json({ error: 'Projekt nie został znaleziony.' }, { status: 404 });
      }
      projectName = project.name;
      const isUserAssigned = project.users.some(user => user.email === session.user.email);
      if (!isUserAssigned) {
        return NextResponse.json({ error: 'Forbidden: Nie jesteś przypisany do tego projektu.' }, { status: 403 });
      }
      connectUsers = project.users.map(user => ({ id: user.id }));
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || TaskStatus.OPEN,
        priority,
        due_to: dueDate,
        ...(projectId ? { project: { connect: { id: projectId } } } : {}),
        ...(connectUsers.length > 0 ? { users: { connect: connectUsers } } : {}),
      },
      include: {
        users: {
          select: { id: true, email: true },
        },
        comments: true,
        project: {
          select: { id: true, name: true },
        },
      },
    });

    const notificationMessage = projectId
      ? `New Task: ${title} in Project: ${projectName}`
      : `New Task: ${title}`;

    try {
      if (newTask.users && newTask.users.length > 0) {
        await prisma.notification.createMany({
          data: newTask.users.map(user => ({
            content: notificationMessage,
            userId: user.id,
          })),
        });
      }
    } catch (notifyError) {
      console.error('Błąd podczas wysyłania powiadomień:', notifyError);
    }

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}
