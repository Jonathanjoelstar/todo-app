
import axios from 'axios';
import Sortable from 'sortablejs';
import Tags from '../models/Tags';
import { ref } from 'vue';
import {Listbox,ListboxButton,ListboxOptions,ListboxOption,Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { CheckIcon } from '@heroicons/vue/20/solid';





console.log('7' + 3);

export default {
   components: {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    Popover,
    PopoverButton,
    PopoverPanel,
    CheckIcon 
  },
    name: 'TagList',
    props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    selectedTags: {
      get() {
        return this.modelValue;
      },
      set(newValues) {
        this.$emit('update:modelValue', newValues);
      }
    }
  },
      data() {
        //Dans un premier données en dur
        const tag1 = new Tags("1","Bug","rgba(241, 97, 60, 1)","Documentation");
        const tag2 = new Tags("2","Backend","rgba(67, 106, 247, 1)","Documentation");
        const tag3 = new Tags("3","Urgent","rgba(241, 59, 59, 1)","Documentation");
        const tag4 = new Tags("4","Feature","rgba(91, 205, 29, 1)","Documentation");
        const tag5 = new Tags("5","Frontend","rgba(185, 29, 205, 1)","Documentation");
        const tag6 = new Tags("6","UI/UX","rgba(51, 59, 205, 1)","Documentation");
        const tags = [tag1,tag2,tag3,tag4,tag5,tag6];

        return {       
          tags,
          hideTag: false
        };
  },
  methods: {
  

//     async fetchTodos() {
//       try {
//         const response = await axios.get('/api/todos');
//         this.todos = response.data;
//       } catch (error) {
//         console.error(error);
//         this.showNotification('Erreur lors de la récupération des tâches.', 'bg-red-100 text-red-700');
//       }
//     },
//     async addTodo() {
//       if (this.newTodo.trim() === '') return;
//       try {
//         const response = await axios.post('/api/todos', { title: this.newTodo });
//         this.todos.push(response.data);
//         this.newTodo = '';
//         this.showNotification('Tâche ajoutée avec succès.', 'bg-green-100 text-green-700');
//       } catch (error) {
//         console.error(error);
//         this.showNotification('Erreur lors de l\'ajout de la tâche.', 'bg-red-100 text-red-700');
//       }
//     },
//     async updateTodo(todo) {
//       try {
//         await axios.patch(`/api/todos/${todo._id}`, { completed: todo.completed });
//         this.showNotification('Tâche mise à jour.', 'bg-green-100 text-green-700');
//       } catch (error) {
//         console.error(error);
//         this.showNotification('Erreur lors de la mise à jour de la tâche.', 'bg-red-100 text-red-700');
//       }
//     },
//     async deleteTodo(id) {
//       try {
//         await axios.delete(`/api/todos/${id}`);
//         this.todos = this.todos.filter(todo => todo._id !== id);
//         this.showNotification('Tâche supprimée.', 'bg-green-100 text-green-700');
//       } catch (error) {
//         console.error(error);
//         this.showNotification('Erreur lors de la suppression de la tâche.', 'bg-red-100 text-red-700');
//       }
//     },
//     async onDragEnd() {
//       try {
//         await axios.put('/api/todos/reorder', { todos: this.todos });
//         this.showNotification('Ordre des tâches mis à jour.', 'bg-green-100 text-green-700');
//       } catch (error) {
//         console.error('Error updating order:', error);
//         this.showNotification('Erreur lors de la mise à jour de l\'ordre.', 'bg-red-100 text-red-700');
//       }
//     },
//     showNotification(message, className) {
//       this.notification = message;
//       this.notificationClass = className;
//       setTimeout(() => {
//         this.notification = '';
//       }, 3000);
//     }
//   },
//   mounted() {
//     this.fetchTodos();

//     // Initialiser Sortable
//     Sortable.create(this.$refs.sortableList, {
//       handle: '.handle',
//       animation: 150,
//       onEnd: this.onDragEnd,
//     });
  }
};

