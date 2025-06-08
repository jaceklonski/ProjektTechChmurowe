const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../prisma');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const userEmail = req.auth?.email;

  if (!userEmail) {
    return res.status(401).json({ error: 'Nieautoryzowany: brak tokena.' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Treść komentarza jest wymagana.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie istnieje.' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      return res.status(404).json({ error: 'Zadanie nie zostało znalezione.' });
    }

    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        task: { connect: { id: taskId } },
        user: { connect: { id: user.id } },
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    return res.status(201).json(newComment);
  } catch (err) {
    console.error('POST /api/tasks/:taskId/comments error:', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.delete('/:commentId', verifyToken, async (req, res) => {
  const { taskId, commentId } = req.params;
  const userEmail = req.auth?.email;

  if (!userEmail) {
    return res.status(401).json({ error: 'Nieautoryzowany: brak tokena.' });
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true },
    });
    if (!comment) {
      return res.status(404).json({ error: 'Komentarz nie został znaleziony.' });
    }
    if (comment.taskId !== taskId) {
      return res.status(400).json({ error: 'Komentarz nie należy do podanego zadania.' });
    }
    if (comment.user.email !== userEmail) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tego komentarza.' });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/tasks/${taskId}/comments/${commentId} error:`, err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
