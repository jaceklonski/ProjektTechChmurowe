import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        users: {
          select: { id: true, email: true },
        },
        tasks: {
          include: {
            users: {
              select: { id: true, email: true },
            },
            comments: {
              include: {
                user: {
                  select: { id: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projekt nie został znaleziony.' }, { status: 404 });
    }
    
    const isUserAssigned = project.users.some(user => user.id === session.user.id);
    if (!isUserAssigned) {
      return NextResponse.json({ error: 'Brak dostępu do tego projektu.' }, { status: 403 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error('GET /api/projects/[projectId] error:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
  }
}
