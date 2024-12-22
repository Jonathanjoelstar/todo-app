<template>
  <div>
    <form @submit.prevent="addTodo" class="flex mb-4">
      <input
        v-model="newTodo"
        type="text"
        placeholder="Ajouter une tâche"
        class="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Ajouter
      </button>
    </form>

    <div ref="sortableList" class="space-y-2">
      <transition-group>
        <li
          v-for="todo in todos"
          :key="todo._id"
          class="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm"
        >
          <div class="flex items-center flex-grow">
            <span class="handle cursor-move mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 8h16M4 16h16" />
              </svg>
            </span>
            <input
              type="checkbox"
              v-model="todo.completed"
              @change="updateTodo(todo)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <div class="ml-2 flex flex-col">
              <span
                :class="{
                  'line-through text-gray-500': todo.completed,
                  'text-gray-900': !todo.completed
                }"
              >
                {{ todo.title }}
              </span>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="tag in todo.tags"
                  :key="tag._id"
                  class="px-2 py-0.5 text-xs rounded-full"
                  :style="{ backgroundColor: tag.color + '20', color: tag.color }"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center ml-2">
            <TagSelector
              :model-value="todo.tags || []"
              @update:modelValue="(newTags) => updateTodoTags(todo, newTags)"
              class="mr-2"
            />
            <button
              @click="deleteTodo(todo._id)"
              class="text-red-500 hover:text-red-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </li>
      </transition-group>
    </div>

    <!-- Notification -->
    <div
      v-if="notification"
      class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg"
      :class="notificationClass"
    >
      {{ notification }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sortable from 'sortablejs';
import TagSelector from './TagSelector.vue';

export default {
  name: 'TodoList',
  components: {
    TagSelector
  },
  data() {
    return {
      todos: [],
      newTodo: '',
      notification: '',
      notificationClass: ''
    };
  },
  methods: {
    async fetchTodos() {
      try {
        const response = await axios.get('/api/todos');
        this.todos = response.data;
      } catch (error) {
        console.error(error);
        this.showNotification('Erreur lors de la récupération des tâches.', 'bg-red-100 text-red-700');
      }
    },
    async addTodo() {
      if (this.newTodo.trim() === '') return;
      try {
        const response = await axios.post('/api/todos', { title: this.newTodo });
        this.todos.push(response.data);
        this.newTodo = '';
        this.showNotification('Tâche ajoutée avec succès.', 'bg-green-100 text-green-700');
      } catch (error) {
        console.error(error);
        this.showNotification('Erreur lors de l\'ajout de la tâche.', 'bg-red-100 text-red-700');
      }
    },
    async updateTodo(todo) {
      try {
        const response = await axios.patch(`/api/todos/${todo._id}`, { completed: todo.completed });
        Object.assign(todo, response.data);
        this.showNotification('Tâche mise à jour.', 'bg-green-100 text-green-700');
      } catch (error) {
        console.error(error);
        this.showNotification('Erreur lors de la mise à jour de la tâche.', 'bg-red-100 text-red-700');
      }
    },
    async updateTodoTags(todo, newTags) {
      try {
        const response = await axios.patch(`/api/todos/${todo._id}`, {
          tags: newTags.map(tag => tag._id)
        });
        
        // S'assurer que todo.tags est initialisé
        if (!todo.tags) {
          todo.tags = [];
        }
        
        // Mettre à jour les tags avec la réponse du serveur
        Object.assign(todo, response.data);
        
        this.showNotification('Tags mis à jour.', 'bg-green-100 text-green-700');
      } catch (error) {
        console.error('Error updating tags:', error);
        this.showNotification('Erreur lors de la mise à jour des tags.', 'bg-red-100 text-red-700');
      }
    },
    async onDragEnd() {
      try {
        await axios.put('/api/todos/reorder', { todos: this.todos });
        this.showNotification('Ordre des tâches mis à jour.', 'bg-green-100 text-green-700');
      } catch (error) {
        console.error('Error updating order:', error);
        this.showNotification('Erreur lors de la mise à jour de l\'ordre.', 'bg-red-100 text-red-700');
      }
    },
    showNotification(message, className) {
      this.notification = message;
      this.notificationClass = className;
      setTimeout(() => {
        this.notification = '';
      }, 3000);
    }
  },
  mounted() {
    this.fetchTodos();

    // Initialiser Sortable
    Sortable.create(this.$refs.sortableList, {
      handle: '.handle',
      animation: 150,
      onEnd: this.onDragEnd,
    });
  }
};
</script>

<style scoped>
.handle {
  display: flex;
  align-items: center;
}

/* Animation pour les transitions */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.v-move {
  transition: transform 0.3s ease;
}
</style>