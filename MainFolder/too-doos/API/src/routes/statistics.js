const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const day = startOfToday.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() + diffToMonday);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [tasksToday, tasksWeek, tasksMonth, tasksYear, usersCount, totalTasks, activeUsersWeek] = await Promise.all([
      prisma.task.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.task.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.task.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.task.count({ where: { createdAt: { gte: startOfYear } } }),
      prisma.user.count(),
      prisma.task.count(),
      prisma.user.count({
        where: {
          tasks: {
            some: { createdAt: { gte: startOfWeek } }
          }
        }
      }),
    ]);

    const avgTasksPerUser = usersCount > 0 ? totalTasks / usersCount : 0;

    return res.status(200).json({
      tasksToday,
      tasksWeek,
      tasksMonth,
      tasksYear,
      usersCount,
      avgTasksPerUser,
      activeUsersWeek,
    });
  } catch (error) {
    console.error('GET /api/statistics error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
