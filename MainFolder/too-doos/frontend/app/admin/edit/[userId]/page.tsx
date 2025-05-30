import EditUserForm from '@/components/EditUserForm';
import { prisma } from '@/lib/prisma';

export default async function Page({ params }: { params: { userId: string } }) {
  const { userId } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    return <div>User not found.</div>;
  }

  const tasksCount = await prisma.task.count({
    where: { users: { some: { id: userId } } }
  });

  const lastTask = await prisma.task.findFirst({
    where: { users: { some: { id: userId } } },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  });

  const lastTaskDate = lastTask ? lastTask.createdAt.toISOString() : null;

  return (
    <EditUserForm 
      user={user} 
      tasksCount={tasksCount} 
      lastTaskDate={lastTaskDate} 
    />
  );
}
