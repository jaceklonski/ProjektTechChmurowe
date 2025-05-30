const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET all projects for authenticated user
router.get('/', async (req, res) => {
  const { userId } = req.headers;

  if (!userId) return res.status(401).json({ error: 'Brak autoryzacji.' });

  try {
    const projects = await prisma.project.findMany({
      where: {
        users: {
          some: { id: userId },
        },
      },
      include: {
        users: { select: { id: true, email: true } },
        tasks: {
          include: {
            users: { select: { id: true, email: true } },
            comments: {
              include: { user: { select: { id: true, email: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ projects });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

// GET one project by ID
router.get('/:projectId', async (req, res) => {
  const { userId } = req.headers;
  const { projectId } = req.params;

  if (!userId) return res.status(401).json({ error: 'Brak autoryzacji.' });

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        users: { select: { id: true, email: true } },
        tasks: {
          include: {
            users: { select: { id: true, email: true } },
            comments: { include: { user: { select: { id: true, email: true } } } },
          },
        },
      },
    });

    if (!project) return res.status(404).json({ error: 'Projekt nie został znaleziony.' });

    const isAssigned = project.users.some(user => user.id === userId);
    if (!isAssigned) return res.status(403).json({ error: 'Brak dostępu do tego projektu.' });

    res.status(200).json({ project });
  } catch (err) {
    console.error(`GET /api/projects/${projectId} error:`, err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

// POST - create a project
router.post('/', async (req, res) => {
  const { userId, userEmail } = req.headers;
  const { name, description, assignees } = req.body;

  if (!userId || !userEmail) return res.status(401).json({ error: 'Brak autoryzacji.' });
  if (!name) return res.status(400).json({ error: 'Nazwa projektu jest wymagana.' });
  if (!Array.isArray(assignees)) return res.status(400).json({ error: 'Nieprawidłowy format assignees.' });

  try {
    const uniqueEmails = [...new Set(assignees.map(email => email.trim().toLowerCase()))];

    const users = await prisma.user.findMany({
      where: { email: { in: uniqueEmails } },
      select: { id: true, email: true },
    });

    const foundEmails = users.map(u => u.email);
    const notFound = uniqueEmails.filter(e => !foundEmails.includes(e));
    if (notFound.length > 0) return res.status(400).json({ error: `Nie znaleziono użytkowników: ${notFound.join(', ')}` });

    if (!foundEmails.includes(userEmail)) {
      const creator = await prisma.user.findUnique({ where: { id: userId } });
      if (creator) users.push(creator);
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        users: { connect: users.map(u => ({ id: u.id })) },
      },
      include: {
        users: { select: { id: true, email: true } },
        tasks: true,
      },
    });

    const notificationMessage = `You've been added to ${newProject.name} Project`;
    const recipients = newProject.users.filter(u => u.email !== userEmail);

    if (recipients.length > 0) {
      await prisma.notification.createMany({
        data: recipients.map(u => ({ content: notificationMessage, userId: u.id })),
      });
    }

    res.status(201).json({ project: newProject });
  } catch (err) {
    console.error('POST /api/projects error:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
