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
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag',
        },
    ],
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'], // Gestion des priorités
        default: 'normal',
    },
});

module.exports = mongoose.model('Todo', TodoSchema);
