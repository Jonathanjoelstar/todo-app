const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    },
    color: {
        type: String,
        default: '#000000',
    }
});

module.exports = mongoose.model('Tag', TagSchema);