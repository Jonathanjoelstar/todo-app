
const Tag = require('../models/Tag');
const Todo = require('../models/Todo');

exports.addTagsToTodo = async (req, res) => {
  const  id = req.params;
  const  tagIds  = req.body;

  try {
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo introuvable' });
    }

    const tags = await Tag.find({ _id: { $in: tagIds } });
    todo.tags.push(...tags.map((tag) => tag._id));
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du tags au todo', error });
  }
};

exports.removeTagsFromTodo = async (req, res) => {
  const id  = req.params;
  const tagIds  = req.body;

  try {
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo introuvable' });
    }

    todo.tags = todo.tags.filter((tagId) => !tagIds.includes(tagId.toString()));
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du tags du todo', error });
  }
};