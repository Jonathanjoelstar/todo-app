const Tag = require('../models/Tag');


// Récupérer tous les tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Créer un nouveau tag
exports.createTag = async (req, res) => {
  try {
    const tag = new Tag(req.body);
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de création', error });
  }
};

// Modifier un tag
exports.updateTag = async (req, res) => {
  try {
    const updatedTag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedTag);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de mise à jour', error });
  }
};

// Supprimer un tag
exports.deleteTag = async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Tag supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur de suppression', error });
  }
};
