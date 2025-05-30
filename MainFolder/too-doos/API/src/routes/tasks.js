const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        users: { select: { id: true, email: true } },
        comments: true,
        project: true,
      },
    });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST /api/tasks - tworzenie nowego zadania
router.post('/', async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    due_to,
    due_time,
    projectId,
    assignees
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Tytuł jest wymagany.' });
  }
  if (priority === undefined) {
    return res.status(400).json({ error: 'Pole "priority" jest wymagane.' });
  }
  if (!due_to) {
    return res.status(400).json({ error: 'Pole "due_to" jest wymagane.' });
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

    if (assignees && assignees.length > 0) {
      const uniqueEmails = Array.from(
        new Set(assignees.map((email) => email.trim().toLowerCase()))
      );

      const users = await prisma.user.findMany({
        where: {
          email: {
            in: uniqueEmails,
          },
        },
        select: {
          id: true,
          email: true,
        },
      });

      const foundEmails = users.map((user) => user.email);
      const notFoundEmails = uniqueEmails.filter(
        (email) => !foundEmails.includes(email)
      );

      if (notFoundEmails.length > 0) {
        return res.status(400).json({
          error: `Nie znaleziono użytkowników z emailami: ${notFoundEmails.join(', ')}`,
        });
      }

      connectUsers = users.map((user) => ({ id: user.id }));
    }

    if ((!assignees || assignees.length === 0) && !projectId) {
      // Tutaj normalnie pobierasz "twórcę" z sesji — na razie pomijamy
      return res
        .status(400)
        .json({ error: 'Brak przypisania do użytkownika lub projektu.' });
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
      connectUsers = project.users.map((user) => ({ id: user.id }));
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'OPEN',
        priority,
        due_to: dueDate,
        ...(projectId ? { project: { connect: { id: projectId } } } : {}),
        ...(connectUsers.length > 0
          ? { users: { connect: connectUsers } }
          : {}),
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

router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        users: { select: { id: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, email: true } }
          }
        },
        project: { select: { id: true, name: true } }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Zadanie nie zostało znalezione.' });
    }

    // (opcjonalnie: sprawdzenie autoryzacji – jeśli w przyszłości będzie auth)

    return res.status(200).json(task);
  } catch (error) {
    console.error('GET /api/tasks/:taskId error:', error);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
