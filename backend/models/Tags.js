const mongoose = require('mongoose');

const TagsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: false
    },

});

module.exports = mongoose.model('Tags', TagsSchema);