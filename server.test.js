const request = require('supertest');
const app = require('./app');

describe('Task API', () => {
  it('POST /tasks should create a new task', async () => {
    const newTask = {
      title: "New Task",
      description: "New Task Description",
      completed: false,
      priority: "low",
    };
    const response = await request(app).post('/tasks').send(newTask);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: 'Success !! Created Successfully' });
  });

  it('POST /tasks with invalid data should return 400', async () => {
    const newTask = {
      title: "New Task",
    };
    const response = await request(app).post('/tasks').send(newTask);
    expect(response.status).toBe(400);
  });

  it('GET /tasks should return all tasks', async () => {
    const response = await request(app).get('/tasks');
    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('description');
    expect(response.body[0]).toHaveProperty('completed');
    expect(response.body[0]).toHaveProperty('priority');
  });

  it('GET /tasks/:id should return task by id', async () => {
    const response = await request(app).get('/tasks/1');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
      title: "Set up environment",
      description: "Install Node.js, npm, and git",
      completed: true,
      priority: "low",
    });
  });

  it('GET /tasks/:id with invalid id should return 404', async () => {
    const response = await request(app).get('/tasks/999');
    expect(response.status).toBe(404);
  });

  it('PATCH /tasks/:id should update a task', async () => {
    const updatedTask = {
      title: "Updated Task",
      description: "Updated Task Description",
      completed: true,
      priority: "high",
    };
    const response = await request(app).patch('/tasks/1').send(updatedTask);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: 'Success!! Edited Successfully' });
  });

  it('PATCH /tasks/:id with invalid id should return 404', async () => {
    const updatedTask = {
      title: "Updated Task",
      description: "Updated Task Description",
      completed: true,
      priority: "high",
    };
    const response = await request(app).patch('/tasks/999').send(updatedTask);
    expect(response.status).toBe(404);
  });

  it('PATCH /tasks/:id with invalid data should return 400', async () => {
    const updatedTask = {
      title: "Updated Task",
      description: "Updated Task Description",
      completed: "true",
      priority: "high",
    };
    const response = await request(app).patch('/tasks/1').send(updatedTask);
    expect(response.status).toBe(400);
  });

  it('DELETE /tasks/:id should delete a task', async () => {
    const response = await request(app).delete('/tasks/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: 'Success!! Deleted Successfully' });
  });

  it('DELETE /tasks/:id with invalid id should return 404', async () => {
    const response = await request(app).delete('/tasks/999');
    expect(response.status).toBe(404);
  });

//   it('GET /tasks/priority/:level should return tasks by priority', async () => {
//     const response = await request(app).get('/tasks/priority/low');
//     expect(response.status).toBe(200);
//     expect(response.body).toEqual([
//       {
//         id: 1,
//         title: "Set up environment",
//         description: "Install Node.js, npm, and git",
//         completed: true,
//         priority: "low",
//       }
//     ]);
//   });

  it('GET /tasks/priority/:level with invalid level should return 400', async () => {
    const response = await request(app).get('/tasks/priority/invalid');
    expect(response.status).toBe(400);
  });
});