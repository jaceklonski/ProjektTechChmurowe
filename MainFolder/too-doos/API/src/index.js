require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');

const { checkJwt } = require('./middleware/auth');
const syncUser = require('./middleware/syncUser');

const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const statisticsRouter = require('./routes/statistics');
const reminderRouter = require('./routes/reminder');
const projectsRouter = require('./routes/projects');


app.use(morgan('dev'));

app.use((req, res, next) => {
  const originalSend = res.send.bind(res);
  res.send = (body) => {
    console.log(`RESPONSE ${res.statusCode} →`, body);
    return originalSend(body);
  };
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api/tasks', checkJwt, syncUser, tasksRouter);
app.use('/api/tasks/:taskId/comments', checkJwt, syncUser, commentsRouter);
app.use('/api/users', checkJwt, syncUser, usersRouter);
app.use('/api/statistics', checkJwt, syncUser, statisticsRouter);
app.use('/api/reminder', checkJwt, syncUser, reminderRouter);
app.use('/api/projects', checkJwt, syncUser, projectsRouter);

app.get('/health', (req, res) => res.send('OK'));

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Nieautoryzowany: ' + err.message });
  }
  next(err);
});

app.listen(5000, () => {
  console.log('API listening on port 5000');
  console.log('Database URL:', process.env.DATABASE_URL);
});
