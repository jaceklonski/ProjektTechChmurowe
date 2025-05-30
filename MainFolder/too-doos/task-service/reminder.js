import { prisma } from '@/lib/prisma';

export async function sendReminders() {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: {
      due_to: {
        lte: oneHourLater,
        gte: now,
      },
      status: { not: 'DONE' },
      reminderSent: false,
    },
    include: {
      users: true,
      project: {
        select: { id: true, name: true },
      },
    },
  });

  for (const task of tasks) {
    const notificationMessage = task.project
      ? `Reminder: ${task.title} in Project: ${task.project.name} is due within one hour`
      : `Reminder: ${task.title} is due within one hour`;

    const notificationsData = task.users.map(user => ({
      content: notificationMessage,
      userId: user.id,
    }));

    if (notificationsData.length > 0) {
      await prisma.notification.createMany({
        data: notificationsData,
      });
    }

    await prisma.task.update({
      where: { id: task.id },
      data: { reminderSent: true },
    });
  }
}
