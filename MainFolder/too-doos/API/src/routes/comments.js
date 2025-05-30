const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        users: { select: { id: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, email: true } }
          }
        }
      }
    });

    if (!task) return res.status(404).json({ error: 'Zadanie nie zostało znalezione.' });

    // 👇 UWAGA: zakładamy brak sesji, więc na razie bez autoryzacji
    return res.status(200).json({ comments: task.comments });
  } catch (err) {
    console.error('GET /api/tasks/:taskId/comments error:', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.post('/', async (req, res) => {
  const { taskId } = req.params;
  const { content, userEmail } = req.body;

  if (!content || !userEmail) {
    return res.status(400).json({ error: 'Wymagane są pola "content" i "userEmail".' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Zadanie nie zostało znalezione.' });

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId: user.id
      },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    return res.status(201).json({ comment });
  } catch (err) {
    console.error('POST /api/tasks/:taskId/comments error:', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
