const Todo = require('../models/Todo');
const Tag = require('../models/Tag');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');



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
        // Get page and limit from query parameters, defaulting to page 1 and limit 5 if not provided
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        // Calculate the number of items to skip based on the page
        const skip = (page - 1) * limit;

        // Fetch todos with pagination
        const todos = await Todo.find()
            .populate('tags')
            .skip(skip) // Skip the first 'skip' items
            .limit(limit); // Limit the number of items

        // Get the total count of todos to calculate total pages
        const totalCount = await Todo.countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / limit);

        // Return the todos and pagination info
        res.status(200).json({
            todos,
            totalPages,
            currentPage: page
        });
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

// Tri par priorité
exports.getTodosByPriority = async (req, res) => {
    try {
        const todos = await Todo.find().sort({ priority: -1 }).populate('tags');
        res.status(200).json(todos);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Filtrer les tâches par tags
exports.getTodosByTag = async (req, res) => {
    const { tagId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Pagination (par défaut page 1 et 10 résultats)

    // Vérifier si page et limit sont des entiers positifs
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
        return res.status(400).json({ message: 'Les paramètres de pagination sont invalides' });
    }

    try {
        // Vérifie si l'ID du tag est valide
        if (!mongoose.Types.ObjectId.isValid(tagId)) {
            return res.status(400).json({ message: 'ID de tag invalide' });
        }

        // Recherche le nombre total de tâches associées au tag
        const totalTasks = await Todo.countDocuments({ tags: tagId });

        // Recherche les tâches associées au tag avec pagination
        const todos = await Todo.find({ tags: tagId })
            .populate('tags')
            .skip((page - 1) * limit)  // Calcul de l'offset
            .limit(Number(limit));    // Limiter le nombre de résultats

        if (!todos || todos.length === 0) {
            return res.status(404).json({ message: 'Aucune tâche trouvée pour ce tag' });
        }

        // Retourne les tâches associées au tag avec des informations sur la pagination
        res.status(200).json({
            todos,
            totalTasks,  // Nombre total de tâches
            totalPages: Math.ceil(totalTasks / limit),  // Nombre total de pages
            currentPage: Number(page),
            perPage: Number(limit)
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches par tag:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
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
                tags, // Le tableau de tags
                priority: priority || 'normal', // Valeur par défaut 'normal' si non spécifiée
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

exports.addTagToTodo = async (req, res) => {
    try {
        console.log('Tag ID:', tagId);
        const { tagId } = req.body;
        const { todoId } = req.params._id;

        if (!mongoose.Types.ObjectId.isValid(tagId)) {
            return res.status(400).json({ message: 'Invalid tag ID' });
        }

        if (!tagId) {
            return res.status(400).json({ message: 'Tag ID is required' });
        }

        // Vérifie si la tâche et le tag existent
        const [todo, tag] = await Promise.all([
            Todo.findById(todoId),
            Tag.findById(tagId),
        ]);

        if (!todo) {
            return res.status(404).json({ success: false, message: 'Tâche introuvable.' });
        }
        if (!tag) {
            return res.status(404).json({ success: false, message: 'Tag introuvable.' });
        }

        // Vérifie si le tag est déjà associé
        if (todo.tags.includes(tagId)) {
            return res.status(400).json({ success: false, message: 'Ce tag est déjà associé à cette tâche.' });
        }

        // Ajoute le tag à la tâche
        todo.tags.push(tagId);
        await todo.save();

        // Récupère les tags mis à jour
        const updatedTodo = await Todo.findById(todoId).populate('tags');

        res.status(200).json({ success: true, tags: updatedTodo.tags });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du tag :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

// Supprimer un tag d'une tâche
exports.removeTagFromTodo = async (req, res) => {
    try {
        const { tagId } = req.body;
        const todoId = req.params.id;

        // Vérifie si la tâche existe
        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ success: false, message: 'Tâche introuvable.' });
        }

        // Vérifie si le tag est associé à la tâche
        if (!todo.tags.includes(tagId)) {
            return res.status(404).json({ success: false, message: 'Tag non associé à cette tâche.' });
        }

        // Supprime le tag de la tâche
        todo.tags = todo.tags.filter(id => id.toString() !== tagId);
        await todo.save();

        // Récupère les tags mis à jour
        const updatedTodo = await Todo.findById(todoId).populate('tags');

        res.status(200).json({ success: true, tags: updatedTodo.tags });
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
