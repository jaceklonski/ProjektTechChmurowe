import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
      },
      orderBy: {
        email: 'asc',
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}
