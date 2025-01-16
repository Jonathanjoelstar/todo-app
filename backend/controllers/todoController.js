const Todo = require('../models/Todo');
const Tag = require('../models/Tag');
const { validationResult } = require('express-validator');

// Utility function to handle errors
const handleErrors = (res, error, message = 'Erreur serveur') => {
    res.status(500).json({ message, error });
};

// Middleware for validating request data
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Récupérer toutes les tâches
exports.getAllTodos = async (req, res) => {
    try {
        const todos = await Todo.find().populate('tags');
        res.status(200).json(todos);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Recherche avec pagination
exports.searchTodos = async (req, res) => {
    const { search = '', page = 1, limit = 10 } = req.query;
    const parsedLimit = parseInt(limit, 10);

    try {
        const todos = await Todo.find({ title: { $regex: search, $options: 'i' } })
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit)
            .populate('tags');
        res.status(200).json(todos);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Filtrage par statut
exports.filterTodos = async (req, res) => {
    const { status } = req.query;
    try {
        const filter = status === 'completed' ? { completed: true } : status === 'pending' ? { completed: false } : {};
        const todos = await Todo.find(filter).populate('tags');
        res.status(200).json(todos);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Filtrer par tag
exports.getTodosByTag = async (req, res) => {
    const { tagId } = req.params;
    try {
        const todos = await Todo.find({ tags: tagId }).populate('tags');
        res.status(200).json(todos);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Tri par priorité
exports.getTodosByPriority = async (req, res) => {
    try {
        const todos = await Todo.find().sort({ priority: -1 }).populate('tags');
        res.status(200).json(todos);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Créer une tâche
exports.createTodo = [
    validateRequest,
    async (req, res) => {
        try {
            const { title, tags, priority } = req.body;
            const todo = new Todo({
                title,
                tags,
                priority: priority || 1,
            });
            await todo.save();
            res.status(201).json(todo);
        } catch (error) {
            handleErrors(res, error, 'Erreur de création');
        }
    },
];

// Mettre à jour une tâche
exports.updateTodo = [
    validateRequest,
    async (req, res) => {
        try {
            const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('tags');
            if (!updatedTodo) {
                return res.status(404).json({ message: 'Tâche introuvable' });
            }
            res.status(200).json(updatedTodo);
        } catch (error) {
            handleErrors(res, error, 'Erreur de mise à jour');
        }
    },
];

// Mettre à jour la priorité
exports.updateTodoPriority = async (req, res) => {
    try {
        const { priority } = req.body;
        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, { priority }, { new: true }).populate('tags');
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }
        res.status(200).json(updatedTodo);
    } catch (error) {
        handleErrors(res, error, 'Erreur de mise à jour de la priorité');
    }
};

// Supprimer une tâche
exports.deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }
        await Todo.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
        handleErrors(res, error, 'Erreur de suppression');
    }
};
// Récupérer une tâche par ID
exports.getTodoById = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id).populate('tags');
        if (!todo) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }
        res.status(200).json(todo);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Ajouter des tags à une tâche
exports.addTagToTodo = async (req, res) => {
    try {
        const { tagId } = req.body;

        if (!tagId) {
            return res.status(400).json({ success: false, message: 'ID du tag non fourni.' });
        }

        // Vérifier si le tag existe
        const isTagExists = await Tag.exists({ _id: tagId });
        if (!isTagExists) {
            return res.status(404).json({ success: false, message: 'Le tag spécifié est introuvable.' });
        }

        // Mettre à jour la tâche
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { tags: tagId } }, // Ajout sans doublons
            { new: true }
        ).populate('tags'); // Inclure les détails des tags

        if (!updatedTodo) {
            return res.status(404).json({ success: false, message: 'Tâche introuvable.' });
        }

        res.status(200).json(updatedTodo);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du tag :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

// Supprimer des tags d'une tâche
exports.removeTagsFromTodo = async (req, res) => {
    try {
        const { tagId } = req.body;

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { $pull: { tags: tagId } }, // Supprimer le tag
            { new: true }
        ).populate('tags'); // Inclure les détails des tags

        if (!updatedTodo) {
            return res.status(404).json({ success: false, message: 'Tâche introuvable.' });
        }

        res.status(200).json(updatedTodo);
    } catch (error) {
        console.error('Erreur lors de la suppression du tag :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


// Réordonner les tâches
exports.reorderTodos = async (req, res) => {
    try {
        const { order } = req.body; // Ex. [{ id: 'todo1', position: 1 }, ...]
        const bulkOps = order.map(({ id, position }) => ({
            updateOne: {
                filter: { _id: id },
                update: { position },
            },
        }));

        await Todo.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Réordonnancement réussi' });
    } catch (error) {
        handleErrors(res, error);
    }
};
