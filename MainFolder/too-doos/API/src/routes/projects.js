const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  const payload = req.auth;
  const userEmail = payload?.email;

  if (!userEmail) {
    return res.status(401).json({ error: 'Brak autoryzacji.' });
  }

  try {
    const userWithProjects = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            users: { select: { id: true, email: true } },
            tasks: {
              select: {
                id: true,
                title: true,
                status: true,
                users: { select: { id: true, email: true } },
                comments: {
                  select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    user: { select: { id: true, email: true } }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!userWithProjects) {
      return res.status(404).json({ error: 'Użytkownik nie istnieje.' });
    }

    return res.status(200).json({ projects: userWithProjects.projects });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.get('/:projectId', async (req, res) => {
  const payload = req.auth;
  const userEmail = payload?.email;
  const projectId = req.params.projectId;

  if (!userEmail) {
    return res.status(401).json({ error: 'Brak autoryzacji.' });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        users: { select: { id: true, email: true } },
        tasks: {
          include: {
            users: { select: { id: true, email: true } },
            comments: { include: { user: { select: { id: true, email: true } } } }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projekt nie został znaleziony.' });
    }

    const isAssigned = project.users.some(user => user.email === userEmail);
    if (!isAssigned) {
      return res.status(403).json({ error: 'Brak dostępu do tego projektu.' });
    }

    return res.status(200).json({ project });
  } catch (err) {
    console.error(`GET /api/projects/${projectId} error:`, err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.post('/', async (req, res) => {
  const payload = req.auth;
  const userEmail = payload?.email;
  const { name, description, assignees } = req.body;

  if (!userEmail) {
    return res.status(401).json({ error: 'Brak autoryzacji.' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nazwa projektu jest wymagana.' });
  }
  if (assignees && !Array.isArray(assignees)) {
    return res.status(400).json({ error: 'Nieprawidłowy format assignees.' });
  }

  try {
    const creator = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true }
    });

    if (!creator) {
      return res.status(404).json({ error: 'Użytkownik nie istnieje.' });
    }

    const connectUsersIds = [creator.id];

    if (assignees && assignees.length > 0) {
      const uniqueEmails = [...new Set(assignees.map(e => e.trim().toLowerCase()))];

      const foundUsers = await prisma.user.findMany({
        where: { email: { in: uniqueEmails } },
        select: { id: true, email: true }
      });

      const foundEmails = foundUsers.map(u => u.email.toLowerCase());
      const notFound = uniqueEmails.filter(e => !foundEmails.includes(e));
      if (notFound.length > 0) {
        return res.status(400).json({ error: `Nie znaleziono użytkowników: ${notFound.join(', ')}` });
      }

      for (const u of foundUsers) {
        if (!connectUsersIds.includes(u.id)) {
          connectUsersIds.push(u.id);
        }
      }
    }

    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        users: { connect: connectUsersIds.map(id => ({ id })) }
      },
      include: {
        users: { select: { id: true, email: true } },
        tasks: { select: { id: true, title: true } }
      }
    });

    const notificationMessage = `Zostałeś dodany do projektu: ${newProject.name}`;
    const recipients = newProject.users.filter(u => u.id !== creator.id);

    if (recipients.length > 0) {
      await prisma.notification.createMany({
        data: recipients.map(u => ({ content: notificationMessage, userId: u.id }))
      });
    }

    return res.status(201).json({ project: newProject });
  } catch (err) {
    console.error('POST /api/projects error:', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
