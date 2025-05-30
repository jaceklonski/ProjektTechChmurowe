import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Brak uprawnień administracyjnych.' }, { status: 403 });
  }

  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: 'User ID jest wymagane.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony.' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/[userId] error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Brak uprawnień administracyjnych.' }, { status: 403 });
  }

  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: 'User ID jest wymagane.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: body.email,
        role: body.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/users/[userId] error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Brak uprawnień administracyjnych.' }, { status: 403 });
  }

  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: 'User ID jest wymagane.' }, { status: 400 });
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: deletedUser }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/users/[userId] error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}
