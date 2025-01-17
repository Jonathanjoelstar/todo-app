# Todo App

## Description
L'application est incomplete, l'architecture optimisé n'a pas été mise en place seul le back-end est quasiment terminé. Les tests ont été rédigé mais pas lancé et un fichier seed est en place pour tester les fonctionnalités en local 

## Prérequis
- Docker
- Docker Compose
- Un éditeur de code (ex. VS Code)
- Node.js (si vous travaillez sans Docker)

## Installation et Déploiement

### 1. Cloner le Dépôt
```bash
git clone https://github.com/Jahzzman/todo-app.git
cd todo-app
```

### 2. Démarrer les Services
```bash
docker-compose up --build
```

### 3. Accéder à l'Application
- Frontend : http://localhost:8080
- Backend API : http://localhost:5001/api/todos

## Dependance a installer
- npm install jest supertest --save-dev
- npm install express-validator
- npm install @headlessui/vue @heroicons/vue

## Structure du Projet

### Frontend
- Technologies utilisées : Vue.js, Tailwind CSS
- Port : 8080
- Dossier : `frontend`

### Backend
- Technologies utilisées : Express.js, MongoDB, Mongoose
- Port : 5001
- Dossier : `backend`

### Base de Données
- Technologie : MongoDB
- Port : 27017
- Volume persistant : `mongo-data`



## Nouvelles Fonctionnalités Implémenter

### 1. Gestion des Tags
#### Frontend
- Interface pour ajouter et gérer des tags personnalisés avec des couleurs
- Assignation de plusieurs tags à une tâche
- Affichage visuel des tags dans la liste des tâches

#### Backend
- Tables pour stocker les tags et leurs associations avec les tâches
- Endpoints API pour la création/modification/suppression des tags
- Gestion des associations tags-tâches partielles

### 2. Filtrage et Recherche
#### Frontend
- Champ de recherche pour filtrer les tâches par titre
- Filtres pour tâches complétées/en cours

#### Backend
- Endpoints de recherche et filtrage
- Optimisation avec index
- Pagination des résultats

### 3. Gestion des Priorités
#### Frontend
- Interface pour définir les priorités (haute, moyenne, basse)

#### Backend
- Champ priorité dans le schéma des tâches
- Endpoints de gestion des priorités
- Tri par priorité côté serveur

### Endpoints Présents

#### Tags
- `GET /api/tags` - Liste tous les tags
- `POST /api/tags` - Crée un nouveau tag
- `PATCH /api/tags/:id` - Modifie un tag
- `DELETE /api/tags/:id` - Supprime un tag
- `POST /api/todos/:id/tags` - Ajoute des tags à une tâche
- `DELETE /api/todos/:id/tags` - Retire des tags d'une tâche

#### Recherche et Filtrage
- `GET /api/todos/search` - Recherche dans les tâches avec pagination
- `GET /api/todos/filter` - Filtre les tâches par statut
- `GET /api/todos/by-tag/:tagId` - Filtre les tâches par tag

#### Priorités
- `PATCH /api/todos/:id/priority` - Met à jour la priorité d'une tâche
- `GET /api/todos/by-priority` - Liste les tâches triées par priorité

### Endpoints Fonctionnel

- `GET /api/tags` - Liste tous les tags
- `POST /api/tags` - Crée un nouveau tag
- `POST /api/todos/:id/tags` - Ajoute des tags à une tâche
- `DELETE /api/todos/:id/tags` - Retire des tags d'une tâche

#### Priorités
- `PATCH /api/todos/:id/priority` - Met à jour la priorité d'une tâche

