const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Importez votre application Express
const Todo = require('../models/Todo');
const Tag = require('../models/Tag');

// Configuration de la base de données en mémoire pour les tests
beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

// Nettoyage après chaque test
afterEach(async () => {
    await Todo.deleteMany();
    await Tag.deleteMany();
});

// Fermeture de la connexion à la base de données après tous les tests
afterAll(async () => {
    await mongoose.connection.close();
});

// Tests pour chaque route du contrôleur
describe('Todo Controller', () => {
    // Récupérer toutes les tâches avec pagination
    describe('GET /api/todos', () => {
        it('devrait retourner une liste de tâches avec pagination', async () => {
            await Todo.insertMany([
                { title: 'Tâche 1', completed: false },
                { title: 'Tâche 2', completed: true },
            ]);

            const res = await request(app).get('/api/todos?page=1&limit=1');

            expect(res.status).toBe(200);
            expect(res.body.todos).toHaveLength(1);
            expect(res.body.totalPages).toBe(2);
            expect(res.body.currentPage).toBe(1);
        });
    });

    // Recherche avec pagination
    describe('GET /api/todos/search', () => {
        it('devrait retourner les tâches correspondant au terme recherché', async () => {
            await Todo.insertMany([
                { title: 'Tâche de test', completed: false },
                { title: 'Autre tâche', completed: true },
            ]);

            const res = await request(app).get('/api/todos/search?search=test');

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toBe('Tâche de test');
        });
    });

    // Filtrage par statut
    describe('GET /api/todos/filter', () => {
        it('devrait retourner les tâches en fonction de leur statut', async () => {
            await Todo.insertMany([
                { title: 'Tâche 1', completed: false },
                { title: 'Tâche 2', completed: true },
            ]);

            const res = await request(app).get('/api/todos/filter?status=completed');

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].completed).toBe(true);
        });
    });

    // Créer une tâche
    describe('POST /api/todos', () => {
        it('devrait créer une nouvelle tâche', async () => {
            const res = await request(app)
                .post('/api/todos')
                .send({ title: 'Nouvelle tâche', priority: 'high' });

            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Nouvelle tâche');
            expect(res.body.priority).toBe('high');
        });

        it('devrait retourner une erreur de validation si le titre est manquant', async () => {
            const res = await request(app).post('/api/todos').send({});

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });
    });

    // Mettre à jour une tâche
    describe('PATCH /api/todos/:id', () => {
        it('devrait mettre à jour une tâche existante', async () => {
            const todo = await Todo.create({ title: 'Tâche à mettre à jour', completed: false });

            const res = await request(app)
                .patch(`/api/todos/${todo._id}`)
                .send({ completed: true });

            expect(res.status).toBe(200);
            expect(res.body.completed).toBe(true);
        });

        it('devrait retourner une erreur si la tâche n\'existe pas', async () => {
            const res = await request(app)
                .patch(`/api/todos/${mongoose.Types.ObjectId()}`)
                .send({ completed: true });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Tâche introuvable');
        });
    });

    // Supprimer une tâche
    describe('DELETE /api/todos/:id', () => {
        it('devrait supprimer une tâche existante', async () => {
            const todo = await Todo.create({ title: 'Tâche à supprimer' });

            const res = await request(app).delete(`/api/todos/${todo._id}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Tâche supprimée avec succès');
        });

        it('devrait retourner une erreur si la tâche n\'existe pas', async () => {
            const res = await request(app).delete(`/api/todos/${mongoose.Types.ObjectId()}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Tâche introuvable');
        });
    });

    // Ajouter un tag à une tâche
    describe('POST /api/todos/:id/tags', () => {
        it('devrait ajouter un tag à une tâche', async () => {
            const todo = await Todo.create({ title: 'Tâche avec tag' });
            const tag = await Tag.create({ name: 'Tag 1' });

            const res = await request(app)
                .post(`/api/todos/${todo._id}/tags`)
                .send({ tagId: tag._id });

            expect(res.status).toBe(200);
            expect(res.body.tags).toHaveLength(1);
            expect(res.body.tags[0].name).toBe('Tag 1');
        });

        it('devrait retourner une erreur si le tag n\'existe pas', async () => {
            const todo = await Todo.create({ title: 'Tâche sans tag' });

            const res = await request(app)
                .post(`/api/todos/${todo._id}/tags`)
                .send({ tagId: mongoose.Types.ObjectId() });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Tag introuvable.');
        });
    });
});
