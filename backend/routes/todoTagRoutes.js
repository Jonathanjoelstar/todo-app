const express = require('express');
const router = express.Router();
const todoTagController = require('../controllers/todoTagController');

router.post('/:id/tags', todoTagController.addTagsToTodo);
router.delete('/:id/tags', todoTagController.removeTagsFromTodo);

module.exports = router;