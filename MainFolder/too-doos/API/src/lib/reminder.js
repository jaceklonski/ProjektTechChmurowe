const prisma = require('../prisma');

async function sendReminders() {
  console.log('[Reminder] Sending reminders...');

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        lte: new Date(),
      },
      completed: false,
    },
    include: {
      users: true,
    },
  });

  for (const task of tasks) {
    for (const user of task.users) {
      console.log(`Przypomnienie: zadanie "${task.title}" dla ${user.email}`);
    }
  }
}

module.exports = { sendReminders };
