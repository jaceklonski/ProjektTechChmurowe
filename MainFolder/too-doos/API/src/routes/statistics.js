const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const dateWeek = new Date(startOfToday);
    dateWeek.setDate(dateWeek.getDate() - 7);
    const dateMonth = new Date(startOfToday);
    dateMonth.setMonth(dateMonth.getMonth() - 1);
    const dateYear = new Date(startOfToday);
    dateYear.setFullYear(dateYear.getFullYear() - 1);

    const tasksToday = await prisma.task.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    const tasksWeek = await prisma.task.count({
      where: {
        createdAt: {
          gte: dateWeek,
        },
      },
    });

    const tasksMonth = await prisma.task.count({
      where: {
        createdAt: {
          gte: dateMonth,
        },
      },
    });

    const tasksYear = await prisma.task.count({
      where: {
        createdAt: {
          gte: dateYear,
        },
      },
    });

    const usersCount = await prisma.user.count();

    const totalTasks = await prisma.task.count();

    const avgTasksPerUser = usersCount > 0 ? totalTasks / usersCount : 0;

    const tasksLastWeek = await prisma.task.findMany({
      where: {
        createdAt: {
          gte: dateWeek,
        },
      },
      select: {
        users: {
          select: { id: true },
        },
      },
    });

    const userIdSet = new Set();
    tasksLastWeek.forEach((task) => {
      task.users.forEach((u) => userIdSet.add(u.id));
    });
    const activeUsersWeek = userIdSet.size;

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
    return res
      .status(500)
      .json({ error: 'Wewnętrzny błąd serwera przy obliczaniu statystyk.' });
  }
});

module.exports = router;
