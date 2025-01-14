const mongoose = require('mongoose');
const Todo = require('./models/Todo');
const Tag = require('./models/Tag');
const Category = require('./models/Category');

// Données par défaut
const categoriesData = [
  { name: 'Documentation' },
  { name: 'Developpement projet 1' },
  { name: 'Developpement projet 2' },
];

const todosData = [
  { title: 'Corriger le bug d\'authentification en production', completed: false },
  { title: 'Implémenter le drag & drop dans la liste des tâches', completed: true },
  { title: 'Optimiser les requêtes MongoDB', completed: false },
  { title: 'Mettre a jour les dépendances npm', completed: false },
];

const tagsData = [
  { name: 'Bug', color: 'rgba(241, 97, 60, 1)' },
  { name: 'Backend', color: 'rgba(67, 106, 247, 1)' },
  { name: 'Urgent', color: 'rgba(241, 59, 59, 1)' },
  { name: 'Feature', color: 'rgba(91, 205, 29, 1)' },
  { name: 'Frontend', color: 'rgba(185, 29, 205, 1)' },
  { name: 'UI/UX', color: 'rgba(51, 59, 205, 1)' },
];

const seedDatabase = async () => {
  try {
    console.log('Remplissage de la base de données en cours...');

    // Supprimer les anciennes données
    await Category.deleteMany({});
    await Todo.deleteMany({});
    await Tag.deleteMany({});
    console.log('Anciennes données supprimées');

    // Insérer les nouvelles données
    const categories = await Category.insertMany(categoriesData);
    console.log('Categories insérées:', categories);

    const todos = await Todo.insertMany(todosData);
    console.log('Todos insérés:', todos);

    // Associer des tags aux catégories et tâches
    const tags = tagsData.map((tag, index) => ({
      ...tag,
      categoryId: categories[index % categories.length]._id,
      todoId: todos[index % todos.length]._id,
    }));

    await Tag.insertMany(tags);
    console.log('Tags insérés:', tags);

    console.log('Base de données remplie avec succès');
  } catch (error) {
    console.error('Erreur lors du remplissage de la base de données:', error);
    process.exit(1);
  }
};

module.exports = seedDatabase;

// Si ce fichier est exécuté directement
if (require.main === module) {
  const connectToDatabase = require('./db'); // Utiliser la connexion centralisée
  connectToDatabase().then(seedDatabase).finally(() => mongoose.connection.close());
}
