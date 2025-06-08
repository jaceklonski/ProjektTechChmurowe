const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.get('/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        users: { select: { id: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Zadanie nie zostało znalezione.' });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error('GET /api/tasks/:taskId error:', error);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.patch('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, priority, due_to, assignees } = req.body;

  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      const validStatuses = ['OPEN', 'IN_PROGRESS', 'DONE'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Nieprawidłowy status zadania.' });
      }
      updateData.status = status;
    }
    if (priority !== undefined) updateData.priority = priority;
    if (due_to !== undefined) {
      const dueDate = new Date(due_to);
      if (isNaN(dueDate.getTime())) {
        return res.status(400).json({ error: 'Nieprawidłowy format daty "due_to".' });
      }
      updateData.due_to = dueDate;
    }

    if (assignees !== undefined) {
      if (!Array.isArray(assignees)) {
        return res.status(400).json({ error: 'Pole "assignees" powinno być tablicą emaili.' });
      }

      const users = await prisma.user.findMany({
        where: {
          email: { in: assignees },
        },
      });

      if (users.length === 0) {
        return res.status(400).json({ error: 'Nie znaleziono użytkowników do przypisania.' });
      }

      updateData.users = {
        set: users.map(user => ({ id: user.id })),
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        users: { select: { id: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('PATCH /api/tasks/:taskId error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Zadanie nie zostało znalezione.' });
    }
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.delete('/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    await prisma.task.delete({
      where: { id: taskId },
    });

    return res.status(200).json({ message: 'Zadanie zostało usunięte.' });
  } catch (error) {
    console.error('DELETE /api/tasks/:taskId error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Zadanie nie zostało znalezione.' });
    }
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
