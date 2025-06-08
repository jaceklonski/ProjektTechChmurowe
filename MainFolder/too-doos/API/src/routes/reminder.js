const express = require('express');
const router = express.Router();
const { sendReminders } = require('../lib/reminder');

router.get('/', async (req, res) => {
  try {
    await sendReminders();
    return res.status(200).json({ message: 'Przypomnienia zostały wysłane pomyślnie.' });
  } catch (error) {
    console.error('Błąd podczas wysyłania przypomnień:', error);
    return res.status(500).json({ error: 'Błąd podczas wysyłania przypomnień.' });
  }
});

module.exports = router;
