const mongoose = require('mongoose');

const TodoTagSchema = new mongoose.Schema({
    todo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo',
        required: true,
    },
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true,
    },
}, {
    timestamps: true,
});

// Empêche les doublons entre un Todo et un Tag
TodoTagSchema.index({ todo: 1, tag: 1 }, { unique: true });

const TodoTag = mongoose.model('TodoTag', TodoTagSchema);

module.exports = TodoTag;
