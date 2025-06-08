const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  const userEmail = req.auth?.email;
  if (!userEmail) {
    return res.status(401).json({ error: 'Nie można zidentyfikować użytkownika.' });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        users: {
          some: {
            email: userEmail,
          },
        },
      },
      include: {
        users: { select: { id: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    due_to,
    due_time,
    projectId,
    assignees,
  } = req.body;

  if (!title || priority === undefined || !due_to) {
    return res.status(400).json({ error: 'Tytuł, priorytet i data są wymagane.' });
  }

  let dueDateString = due_to;
  if (due_time) {
    dueDateString = `${due_to}T${due_time}:00`;
  }
  const dueDate = new Date(dueDateString);
  if (isNaN(dueDate.getTime())) {
    return res.status(400).json({ error: 'Nieprawidłowy format daty/godziny.' });
  }

  if (projectId && assignees && assignees.length > 0) {
    return res.status(400).json({
      error: 'Nie można jednocześnie przypisywać do projektu i użytkowników.',
    });
  }

  try {
    let connectUsers = [];
    const userEmail = req.auth?.email;

    if (assignees?.length > 0) {
      const uniqueEmails = [...new Set(assignees.map(email => email.trim().toLowerCase()))];

      const users = await prisma.user.findMany({
        where: {
          email: { in: uniqueEmails },
        },
        select: { id: true, email: true },
      });

      const foundEmails = users.map(user => user.email);
      const notFoundEmails = uniqueEmails.filter(email => !foundEmails.includes(email));

      if (notFoundEmails.length > 0) {
        return res.status(400).json({
          error: `Nie znaleziono użytkowników: ${notFoundEmails.join(', ')}`,
        });
      }

      connectUsers = users.map(user => ({ id: user.id }));
    }

    if ((!assignees || assignees.length === 0) && !projectId) {
      if (!userEmail) {
        return res.status(400).json({ error: 'Nie można zidentyfikować użytkownika.' });
      }

      const currentUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'Użytkownik nie istnieje.' });
      }

      connectUsers = [{ id: currentUser.id }];
    }

    let projectName = '';
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { users: true },
      });
      if (!project) {
        return res.status(404).json({ error: 'Projekt nie został znaleziony.' });
      }
      projectName = project.name;
      connectUsers = project.users.map(user => ({ id: user.id }));
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'OPEN',
        priority,
        due_to: dueDate,
        ...(projectId ? { project: { connect: { id: projectId } } } : {}),
        ...(connectUsers.length > 0 ? { users: { connect: connectUsers } } : {}),
      },
      include: {
        users: { select: { id: true, email: true } },
        comments: true,
        project: { select: { id: true, name: true } },
      },
    });

    const notificationMessage = projectId
      ? `New Task: ${title} in Project: ${projectName}`
      : `New Task: ${title}`;

    if (newTask.users.length > 0) {
      await prisma.notification.createMany({
        data: newTask.users.map((user) => ({
          content: notificationMessage,
          userId: user.id,
        })),
      });
    }

    return res.status(201).json({ task: newTask });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.get('/:taskId', verifyToken, async (req, res) => {
  const userEmail = req.auth?.email;
  if (!userEmail) {
    return res.status(401).json({ error: 'Nie można zidentyfikować użytkownika.' });
  }

  try {
    const { taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        users: {
          some: { email: userEmail },
        },
      },
      include: {
        users: { select: { id: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Zadanie nie zostało znalezione lub brak dostępu.' });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error('GET /api/tasks/:taskId error:', error);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.patch('/:taskId', verifyToken, async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status jest wymagany.' });
  }

  const userEmail = req.auth?.email;
  if (!userEmail) {
    return res.status(400).json({ error: 'Nie można zidentyfikować użytkownika.' });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie istnieje.' });
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        users: {
          some: { id: currentUser.id },
        },
      },
      include: { users: { select: { id: true } } },
    });
    if (!existingTask) {
      return res.status(404).json({ error: 'Zadanie nie zostało znalezione lub brak dostępu.' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        users: { select: { id: true, email: true } },
        comments: {
          include: { user: { select: { id: true, email: true } } },
        },
        project: { select: { id: true, name: true } },
      },
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error(`PATCH /api/tasks/${taskId} error:`, error);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
