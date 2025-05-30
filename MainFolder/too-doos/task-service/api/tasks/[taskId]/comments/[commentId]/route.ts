import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { taskId: string; commentId: string } }
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json({ error: 'Brak autoryzacji.' }, { status: 401 });
    }
  
    try {
      const { taskId, commentId } = params;
  
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { user: true, task: { include: { users: true } } },
      });
  
      if (!comment) {
        return NextResponse.json({ error: 'Komentarz nie został znaleziony.' }, { status: 404 });
      }
  
      const isOwner = comment.user.email === session.user.email;
      const isAssignedToTask = comment.task.users.some(user => user.email === session.user.email);
  
      if (!isOwner && !isAssignedToTask) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await prisma.comment.delete({
        where: { id: commentId },
      });
  
      return NextResponse.json({ message: 'Komentarz został usunięty.' }, { status: 200 });
    } catch (error) {
      console.error(`DELETE /api/tasks/${params.taskId}/comments/${params.commentId} error:`, error);
      return NextResponse.json({ error: 'Wewnętrzny błąd serwera.' }, { status: 500 });
    }
  }