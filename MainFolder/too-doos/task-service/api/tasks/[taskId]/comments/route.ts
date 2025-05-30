import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function POST(
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
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Treść komentarza jest wymagana.' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        users: true,
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Zadanie nie zostało znalezione.' }, { status: 404 });
    }

    const isAssigned = task.users.some(user => user.email === session.user.email);
    if (!isAssigned) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        task: { connect: { id: taskId } },
        user: { connect: { email: session.user.email } },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const notificationMessage = task.project
      ? `New comment in ${task.title} in ${task.project.name}`
      : `New comment in ${task.title}`;

    const recipients = task.users.filter(user => user.email !== session.user.email);
    if (recipients.length > 0) {
      await prisma.notification.createMany({
        data: recipients.map(user => ({
          content: notificationMessage,
          userId: user.id,
        })),
      });
    }
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${params.taskId}/comments error:`, error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}
