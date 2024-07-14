const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const taskFilePath = path.join(__dirname, 'tasks.json');

const readTasksFromFile = () => {
  try {
    const data = fs.readFileSync(taskFilePath, 'utf-8');
    return JSON.parse(data).tasks;
  } catch (e) {
    console.error('Error reading tasks.json:', e);
    return [];
  }
};

const writeTasksToFile = (tasks) => {
  try {
    fs.writeFileSync(taskFilePath, JSON.stringify({ tasks }, null, 2));
  } catch (e) {
    console.error('Error writing to tasks.json:', e);
  }
};

app.get('/tasks', (req, res) => {
  let { completed, sortBy } = req.query;

  let tasks = readTasksFromFile();

  if (completed) {
    const completedBool = completed === 'true';
    tasks = tasks.filter(task => task.completed === completedBool);
  }

  if (sortBy === 'date') {
    tasks = tasks.sort((a, b) => a.id - b.id);
  }

  return res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const tasks = readTasksFromFile();
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Failure!! Task not found' });
  return res.json(task);
});

app.get('/tasks/priority/:level', (req, res) => {
  const tasks = readTasksFromFile();
  const { level } = req.params;
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(level)) {
    return res.status(400).json({ error: 'Failure!! Invalid priority level' });
  }
  const filteredTasks = tasks.filter(task => task.priority === level);
  res.json(filteredTasks);
});

app.post('/tasks', (req, res) => {
  const { title, description, completed, priority } = req.body;
  const validPriorities = ['low', 'medium', 'high'];

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Failure !! Title is required and must be a string' });
  }

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required and must be a string' });
  }

  if (completed === undefined || typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed status is required and must be a boolean' });
  }

  if (!priority || !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority is required and must be one of: low, medium, high' });
  }

  const tasks = readTasksFromFile();
  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    description,
    completed,
    priority
  };

  tasks.push(newTask);
  writeTasksToFile(tasks);
  res.status(201).json({ success: 'Success !! Created Successfully' });
});

app.patch('/tasks/:id', (req, res) => {
  const { title, description, completed, priority } = req.body;
  const validPriorities = ['low', 'medium', 'high'];
  const tasks = readTasksFromFile();

  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Failure!! Task not found' });

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title must be a non-empty string' });
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    return res.status(400).json({ error: 'Description must be a non-empty string' });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed status must be a boolean' });
  }

  if (priority !== undefined && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be one of: low, medium, high' });
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = completed;
  if (priority !== undefined) task.priority = priority;

  writeTasksToFile(tasks);
  res.status(201).json({ success: 'Success!! Edited Successfully' });
});

app.delete('/tasks/:id', (req, res) => {
  let tasks = readTasksFromFile();
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Failure!! Task not found' });

  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  writeTasksToFile(tasks);
  return res.status(200).json({ success: 'Success!! Deleted Successfully' });
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;