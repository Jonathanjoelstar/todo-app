const Tag = require('../models/Tag');
const Category = require('../models/Category');

exports.getAllCategory = async (req, res) => {
  try {
    const category = await Category.find(); 
    res.status(200).json(category);   
  } catch (error) {
    console.error("Erreur lors de la récupération des tags :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des tags", error });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find(); 
    res.status(200).json(tags);   
  } catch (error) {
    console.error("Erreur lors de la récupération des tags :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des tags", error });
  }
};

exports.createTag = async (req, res) => {
  const { name, color, categoryId } = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }

    const newTag = new Tag({ name, color, categoryId });
    await newTag.save();
    res.status(200).json(newTag);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création dutag', error });
  }
};

exports.updateTag = async (req, res) => {
  const  id  = req.params.id;
  const { name, color } = req.body;

  try {
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { name, color },
      { new: true }
    );
    if (!updatedTag) {
      return res.status(404).json({ message: 'Tag introuvable' });
    }
    res.status(200).json(updatedTag);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tag', error });
  }
};

exports.deleteTag = async (req, res) => {
  const id  = req.params.id;;

  try {
    const deletedTag = await Tag.findByIdAndDelete(id);
    if (!deletedTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tag', error });
  }
};