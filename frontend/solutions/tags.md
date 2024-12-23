# Feature: Gestion des Tags dans l'application Todo

## Vue d'ensemble

Cette feature ajoute la gestion des tags aux tâches de l'application Todo. Elle permet de :
- Créer des tags avec un nom et une couleur personnalisée
- Associer des tags aux tâches
- Supprimer des tags
- Visualiser les tags associés à chaque tâche

## Structure technique

### Composants Vue

#### TagSelector.vue
Ce composant gère l'interface utilisateur des tags. Il comprend :
- Un bouton pour ouvrir le dropdown
- Un formulaire pour créer de nouveaux tags
- Une liste des tags existants avec possibilité de sélection/désélection
- Un bouton de suppression pour chaque tag

Points clés de l'implémentation :
```javascript
// Gestion du v-model avec les props et events
props: {
  modelValue: {
    type: Array,
    default: () => []
  }
},
emits: ['update:modelValue']
```

#### Integration dans TodoList.vue
Le TagSelector est intégré dans chaque item de la todo list :
```vue
<TagSelector
  :model-value="todo.tags"
  @update:modelValue="(newTags) => updateTodoTags(todo, newTags)"
  class="mr-2"
/>
```

### Backend

#### Modèle Tag (Tag.js)
```javascript
const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    color: {
        type: String,
        default: '#3B82F6'
    }
});
```

#### Routes API

- GET /api/tags : Récupère tous les tags
- POST /api/tags : Crée un nouveau tag
- DELETE /api/tags/:id : Supprime un tag
- PATCH /api/todos/:id : Met à jour les tags d'une tâche

## Points d'attention

1. **Gestion du state**
   - Les tags sont stockés à la fois dans le composant TagSelector (tags disponibles) et dans chaque todo (tags sélectionnés)
   - La synchronisation se fait via le v-model et les events

2. **Fermeture du dropdown**
   - Utilisation d'un gestionnaire d'événements natif pour détecter les clics en dehors du dropdown
   - Important de nettoyer le listener dans beforeUnmount

3. **Optimisation des performances**
   - Les tags sont chargés une seule fois à l'ouverture du dropdown
   - Utilisation de v-show au lieu de v-if pour le dropdown

## Exemple d'utilisation

### Création d'un tag
```javascript
async createTag() {
  if (this.newTagName.trim() === '') return;
  
  try {
    const response = await axios.post('/api/tags', {
      name: this.newTagName,
      color: this.newTagColor
    });
    this.tags.push(response.data);
    this.newTagName = '';
  } catch (error) {
    console.error('Error creating tag:', error);
  }
}
```

### Mise à jour des tags d'une tâche
```javascript
async updateTodoTags(todo, newTags) {
  try {
    const response = await axios.patch(`/api/todos/${todo._id}`, {
      tags: newTags.map(tag => tag._id)
    });
    Object.assign(todo, response.data);
  } catch (error) {
    console.error(error);
  }
}
```

## Dépannage commun

1. **Le dropdown ne se ferme pas**
   - Vérifier l'implémentation du clickOutsideHandler
   - S'assurer que le listener est bien nettoyé

2. **Les tags ne se mettent pas à jour**
   - Vérifier la synchronisation entre modelValue et selectedTags
   - S'assurer que la mise à jour est émise avec une nouvelle référence

3. **Problèmes de rendu visuel**
   - Vérifier les classes Tailwind pour le positionnement
   - S'assurer que le z-index est correct pour le dropdown

## Tests recommandés

1. **Création de tags**
   - Créer un tag avec un nom valide
   - Tenter de créer un tag avec un nom vide
   - Tenter de créer un tag avec un nom existant

2. **Sélection de tags**
   - Sélectionner un tag pour une tâche
   - Désélectionner un tag
   - Vérifier la persistance après rechargement

3. **Suppression de tags**
   - Supprimer un tag non utilisé
   - Supprimer un tag associé à des tâches

## Ressources

- [Documentation Vue.js sur les Props](https://vuejs.org/guide/components/props.html)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation MongoDB sur les relations](https://www.mongodb.com/docs/manual/reference/database-references/)