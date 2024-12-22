const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

// GET all tags
router.get('/', async (req, res) => {
    try {
        const tags = await Tag.find();
        res.json(tags);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a tag
router.post('/', async (req, res) => {
    const tag = new Tag({
        name: req.body.name,
        color: req.body.color
    });
    try {
        const newTag = await tag.save();
        res.status(201).json(newTag);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a tag
router.delete('/:id', async (req, res) => {
    try {
        await Tag.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tag deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;