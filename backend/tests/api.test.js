const request = require('supertest');
const app = require('../app');

describe('API Tests', () => {
    test('GET /api/todos - Liste des tâches', async () => {
        const res = await request(app).get('/api/todos');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/todos - Créer une tâche', async () => {
        const res = await request(app)
            .post('/api/todos')
            .send({ title: 'Nouvelle tâche', priority: 'high' });
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Nouvelle tâche');
    });

    test('PATCH /api/todos/:id - Mettre à jour une tâche', async () => {
        const todo = await request(app).post('/api/todos').send({ title: 'À mettre à jour' });
        const res = await request(app)
            .patch(`/api/todos/${todo.body._id}`)
            .send({ completed: true });
        expect(res.statusCode).toBe(200);
        expect(res.body.completed).toBe(true);
    });

    // Ajoutez d'autres tests pour chaque route
});
