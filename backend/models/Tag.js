const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    color: {
        type: String,
        default: '#3B82F6'
    }
});

module.exports = mongoose.model('Tag', TagSchema);