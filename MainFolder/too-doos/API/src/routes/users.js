const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  const { userEmail, userId } = req.headers;

  if (!userEmail || !userId) {
    return res.status(401).json({ error: 'Brak autoryzacji.' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: { id: userId },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
      },
      orderBy: { email: 'asc' },
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.get('/:userId', async (req, res) => {
  const { userRole } = req.headers;
  const { userId } = req.params;

  if (userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Brak uprawnień administracyjnych.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(`GET /api/users/${userId} error:`, err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.put('/:userId', async (req, res) => {
  const { userRole } = req.headers;
  const { userId } = req.params;
  const { email, role } = req.body;

  if (userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Brak uprawnień administracyjnych.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email, role },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error(`PUT /api/users/${userId} error:`, err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

router.delete('/:userId', async (req, res) => {
  const { userRole } = req.headers;
  const { userId } = req.params;

  if (userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Brak uprawnień administracyjnych.' });
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({ user: deletedUser });
  } catch (err) {
    console.error(`DELETE /api/users/${userId} error:`, err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
});

module.exports = router;
