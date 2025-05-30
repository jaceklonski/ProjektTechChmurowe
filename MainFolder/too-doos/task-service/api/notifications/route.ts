import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
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
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Treść powiadomienia jest wymagana.' }, { status: 400 });
    }

    const newNotification = await prisma.notification.create({
      data: {
        content,
        user: { connect: { id: session.user.id } },
      },
    });

    return NextResponse.json({ notification: newNotification }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID powiadomienia jest wymagane.' }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Powiadomienie nie zostało znalezione lub nie masz do niego dostępu.' }, { status: 404 });
    }

    const deletedNotification = await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ notification: deletedNotification }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/notifications error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}
