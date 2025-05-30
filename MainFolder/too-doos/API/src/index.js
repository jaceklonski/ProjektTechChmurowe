// src/index.js
const express = require('express');
const app = express();


const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth'); // <- poprawna sciezka do index.js w auth
const commentsRouter = require('./routes/comments');

app.use(express.json());
app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter); // <- tylko raz uzywamy /api/auth
app.use('/api/tasks/:taskId/comments', commentsRouter);

app.get('/health', (req, res) => res.send('OK'));

app.listen(5000, () => {
  console.log('API listening on port 5000');
  console.log('Database URL:', process.env.DATABASE_URL);
});
