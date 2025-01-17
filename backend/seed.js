const mongoose = require('mongoose');
const Todo = require('./models/Todo');
const Tag = require('./models/Tag');

// Données par défaut
const todosData = [
  { title: "Corriger le bug d'authentification en production", completed: false, priority: 'high', position: 1, tags: [] },
  { title: 'Implémenter le drag & drop dans la liste des tâches', completed: true, priority: 'normal', position: 2, tags: [] },
  { title: 'Optimiser les requêtes MongoDB', completed: false, priority: 'high', position: 3, tags: [] },
  { title: 'Mettre à jour les dépendances npm', completed: false, priority: 'low', position: 4, tags: [] },
];

const tagsData = [
  { name: 'Bug', color: 'rgba(241, 97, 60, 1)' },
  { name: 'Backend', color: 'rgba(67, 106, 247, 1)' },
  { name: 'Urgent', color: 'rgba(241, 59, 59, 1)' },
  { name: 'Feature', color: 'rgba(91, 205, 29, 1)' },
  { name: 'Frontend', color: 'rgba(185, 29, 205, 1)' },
  { name: 'UI/UX', color: 'rgba(51, 59, 205, 1)' },
];

// Fonction pour remplir la base de données
const seedDatabase = async () => {
  try {
    console.log('Remplissage de la base de données en cours...');

    // Supprimer les anciennes données
    await Todo.deleteMany({});
    await Tag.deleteMany({});
    console.log('Anciennes données supprimées.');

    // Insérer les nouvelles données dans Tag
    const tags = await Tag.insertMany(tagsData);
    console.log('Tags insérés avec succès.');

    // Associer les tags aux todos
    const todosWithTags = [
      {
        ...todosData[0],
        tags: [tags.find(tag => tag.name === 'Bug')._id, tags.find(tag => tag.name === 'Urgent')._id], // Bug, Urgent
      },
      {
        ...todosData[1],
        tags: [tags.find(tag => tag.name === 'Feature')._id, tags.find(tag => tag.name === 'Frontend')._id], // Feature, Frontend
      },
      {
        ...todosData[2],
        tags: [tags.find(tag => tag.name === 'Backend')._id, tags.find(tag => tag.name === 'Urgent')._id], // Backend, Urgent
      },
      {
        ...todosData[3],
        tags: [tags.find(tag => tag.name === 'UI/UX')._id], // UI/UX
      },
    ];

    // Insérer les todos dans la base
    const todos = await Todo.insertMany(todosWithTags);
    console.log('Todos insérés avec succès.');

    console.log('Base de données remplie avec succès.');
  } catch (error) {
    console.error('Erreur lors du remplissage de la base de données :', error);
    process.exit(1);
  }
};

// Si ce fichier est exécuté directement
if (require.main === module) {
  const connectToDatabase = require('./db'); // Utiliser la connexion centralisée
  connectToDatabase()
    .then(seedDatabase)
    .finally(() => mongoose.connection.close());
}

module.exports = seedDatabase;
