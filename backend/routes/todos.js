const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// Routes spécifiques pour la gestion des tâches
router.get('/search', todoController.searchTodos);
router.get('/filter', todoController.filterTodos);
router.get('/by-priority', todoController.getTodosByPriority);
router.get('/by-tag/:tagId', todoController.getTodosByTag);

// CRUD routes pour les tâches
router.get('/', todoController.getAllTodos); // Obtenir toutes les tâches
router.get('/:id', todoController.getTodoById); // Obtenir une tâche par ID
router.post('/', todoController.createTodo); // Créer une nouvelle tâche
router.patch('/:id', todoController.updateTodo); // Mettre à jour une tâche
router.delete('/:id', todoController.deleteTodo); // Supprimer une tâche

// Routes supplémentaires
router.patch('/:id/priority', todoController.updateTodoPriority); // Mettre à jour la priorité
router.post('/:id/tags', todoController.addTagToTodo); // Ajouter des tags a une tache
router.delete('/:id/tags', todoController.removeTagFromTodo); // Supprimer des tags d'une tache
router.put('/reorder', todoController.reorderTodos); // Réordonner les tâches

module.exports = router;
