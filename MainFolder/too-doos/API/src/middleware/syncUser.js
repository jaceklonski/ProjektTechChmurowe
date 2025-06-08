const prisma = require('../prisma');

async function syncUser(req, res, next) {
  const payload = req.auth;
  const email = payload?.email;

  if (!email) {
    return res.status(401).json({ error: 'Brak autoryzacji.' });
  }

  try {
    await prisma.user.upsert({
      where: { email },
      update: { updatedAt: new Date() },
      create: {
        email,
        password: '',   
        role: 'USER'
      }
    });
    next();
  } catch (err) {
    console.error('Błąd przy upsecie usera w syncUser middleware:', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
}

module.exports = syncUser;
