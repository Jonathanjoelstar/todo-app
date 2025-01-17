const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    position: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal',
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId, // C'est une référence vers le modèle Tag
        ref: 'Tag', // Nom du modèle Tag
    }],
});

module.exports = mongoose.model('Todo', TodoSchema);
