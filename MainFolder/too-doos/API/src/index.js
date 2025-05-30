const express = require('express');
const app = express();

const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth'); 
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const statisticsRouter = require('./routes/statistics');
const reminderRouter = require('./routes/reminder');
const projectsRouter = require('./routes/projects');

app.use(express.json());
app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter); 
app.use('/api/tasks/:taskId/comments', commentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/reminder', reminderRouter);
app.use('/api/projects', projectsRouter); 

app.get('/health', (req, res) => res.send('OK'));

app.listen(5000, () => {
  console.log('API listening on port 5000');
  console.log('Database URL:', process.env.DATABASE_URL);
});
