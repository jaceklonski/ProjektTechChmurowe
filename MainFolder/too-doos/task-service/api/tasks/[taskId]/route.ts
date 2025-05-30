import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const { taskId } = params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Zadanie nie zostało znalezione.' }, { status: 404 });
    }

    const isAssigned = task.users.some(user => user.email === session.user.email);

    if (!isAssigned) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error('GET /api/tasks/[taskId] error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const { taskId } = params;
    const body = await request.json();
    const { title, description, status, priority, due_to, assignees } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      const validStatuses = ['OPEN', 'IN_PROGRESS', 'DONE'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Nieprawidłowy status zadania.' }, { status: 400 });
      }
      updateData.status = status;
    }
    if (priority !== undefined) updateData.priority = priority;
    if (due_to !== undefined) {
      const dueDate = new Date(due_to);
      if (isNaN(dueDate.getTime())) {
        return NextResponse.json({ error: 'Nieprawidłowy format daty "due_to".' }, { status: 400 });
      }
      updateData.due_to = dueDate;
    }

    if (assignees !== undefined) {
      if (!Array.isArray(assignees)) {
        return NextResponse.json({ error: 'Pole "assignees" powinno być tablicą emaili.' }, { status: 400 });
      }

      const users = await prisma.user.findMany({
        where: {
          email: {
            in: assignees,
          },
        },
      });

      if (users.length === 0) {
        return NextResponse.json({ error: 'Nie znaleziono użytkowników do przypisania.' }, { status: 400 });
      }

      updateData.users = {
        set: users.map(user => ({ id: user.id })),
      };
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { users: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Zadanie nie zostało znalezione.' }, { status: 404 });
    }

    const isAssigned = existingTask.users.some(user => user.email === session.user.email);

    if (!isAssigned) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: any) {
    console.error('PATCH /api/tasks/[taskId] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Zadanie nie zostało znalezione.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const { taskId } = params;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { users: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Zadanie nie zostało znalezione.' }, { status: 404 });
    }

    const isAssigned = existingTask.users.some(user => user.email === session.user.email);

    if (!isAssigned) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Zadanie zostało usunięte.' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/tasks/[taskId] error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}
