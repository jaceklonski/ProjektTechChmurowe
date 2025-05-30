import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

interface CreateProjectRequestBody {
  name: string;
  description?: string;
  assignees: string[];
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
        tasks: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, assignees } = body as CreateProjectRequestBody;

    if (!name) {
      return NextResponse.json({ error: 'Nazwa projektu jest wymagana.' }, { status: 400 });
    }

    if (!Array.isArray(assignees)) {
      return NextResponse.json({ error: 'Nieprawidłowy format assignees.' }, { status: 400 });
    }

    const uniqueEmails = Array.from(new Set(assignees.map(email => email.trim().toLowerCase())));

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

    const assigneeEmails = users.map(user => user.email);
    if (!assigneeEmails.includes(session.user.email)) {
      const creator = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true },
      });

      if (creator) {
        users.push(creator);
      }
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        users: {
          connect: users.map(user => ({ id: user.id })),
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
        tasks: true,
      },
    });

    const notificationMessage = `You've been added to ${newProject.name} Project`;
    const recipients = newProject.users.filter(user => user.email !== session.user.email);

    try {
      if (recipients.length > 0) {
        await prisma.notification.createMany({
          data: recipients.map(user => ({
            content: notificationMessage,
            userId: user.id,
          })),
        });
      }
    } catch (notificationError) {
      console.error('Błąd podczas wysyłania powiadomień:', notificationError);
    }

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera.' },
      { status: 500 }
    );
  }
}