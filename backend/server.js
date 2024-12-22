const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialisation de l'app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/todos';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import des modèles (avant les routes)
require('./models/Tag');
require('./models/Todo');

// Import des routes (après les modèles)
const todoRoutes = require('./routes/todos');
const tagRoutes = require('./routes/tags');

// Configuration des routes
app.use('/api/todos', todoRoutes);
app.use('/api/tags', tagRoutes);

// Connexion à MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});