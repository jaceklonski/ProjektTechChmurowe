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

router.delete('/:commentId', async (req, res) => {
  const { taskId, commentId } = req.params;
  const userEmail = req.headers['x-user-email'];

  if (!userEmail) return res.status(401).json({ error: 'Brak autoryzacji.' });

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
        task: {
          include: { users: true }
        }
      }
    });

    if (!comment) return res.status(404).json({ error: 'Komentarz nie został znaleziony.' });

    const isOwner = comment.user.email === userEmail;
    const isAssigned = comment.task.users.some(user => user.email === userEmail);

    if (!isOwner && !isAssigned) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia komentarza.' });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return res.status(200).json({ message: 'Komentarz został usunięty.' });
  } catch (err) {
    console.error(`DELETE /api/tasks/${taskId}/comments/${commentId} error:`, err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
