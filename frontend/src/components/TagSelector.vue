<template>
    <div class="relative">
      <button 
        @click="toggleDropdown" 
        class="p-1 rounded hover:bg-gray-100"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </button>
  
      <div v-show="isOpen" 
           class="absolute z-50 right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
        <div class="p-3">
          <!-- Formulaire d'ajout de tag -->
          <div class="flex items-center justify-between mb-3">
            <input
              v-model="newTagName"
              @keyup.enter="createTag"
              placeholder="Nouveau tag"
              class="flex-grow px-2 py-1 text-sm border rounded mr-2"
            />
            <input
              v-model="newTagColor"
              type="color"
              class="w-8 h-8 rounded cursor-pointer"
            />
            <button 
              @click="createTag"
              class="ml-2 p-1 text-green-600 hover:bg-green-50 rounded"
              title="Ajouter le tag"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
  
          <!-- Liste des tags -->
          <div class="max-h-48 overflow-y-auto">
            <div v-if="tags.length === 0" class="text-gray-500 text-center py-2">
              Aucun tag disponible
            </div>
            <div
              v-for="tag in tags"
              :key="tag._id"
              class="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded group"
            >
              <div 
                class="flex items-center flex-grow cursor-pointer"
                @click="toggleTag(tag)"
              >
                <span
                  class="w-3 h-3 rounded-full mr-2"
                  :style="{ backgroundColor: tag.color }"
                ></span>
                <span class="text-sm">{{ tag.name }}</span>
                <span 
                  v-if="isTagSelected(tag)"
                  class="ml-2 text-blue-500"
                >✓</span>
              </div>
              <button 
                @click="deleteTag(tag)"
                class="invisible group-hover:visible p-1 text-red-500 hover:bg-red-50 rounded"
                title="Supprimer le tag"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'TagSelector',
    props: {
      modelValue: {
        type: Array,
        default: () => []
      }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        isOpen: false,
        tags: [],
        newTagName: '',
        newTagColor: '#3B82F6',
        selectedTags: [],
        clickOutsideHandler: null
      };
    },
    methods: {
      async fetchTags() {
        try {
          const response = await axios.get('/api/tags');
          this.tags = response.data;
          this.selectedTags = this.modelValue.map(tag => {
            const foundTag = this.tags.find(t => t._id === tag._id);
            return foundTag || tag;
          }).filter(Boolean);
        } catch (error) {
          console.error('Error fetching tags:', error);
        }
      },
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
      },
      async deleteTag(tag) {
        try {
          await axios.delete(`/api/tags/${tag._id}`);
          this.tags = this.tags.filter(t => t._id !== tag._id);
          this.selectedTags = this.selectedTags.filter(t => t._id !== tag._id);
          this.$emit('update:modelValue', [...this.selectedTags]);
        } catch (error) {
          console.error('Error deleting tag:', error);
        }
      },
      toggleDropdown() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
          this.fetchTags();
          this.addClickOutsideListener();
        } else {
          this.removeClickOutsideListener();
        }
      },
      closeDropdown() {
        this.isOpen = false;
        this.removeClickOutsideListener();
      },
      addClickOutsideListener() {
        this.clickOutsideHandler = (event) => {
          const el = this.$el;
          if (!el.contains(event.target)) {
            this.closeDropdown();
          }
        };
        document.addEventListener('click', this.clickOutsideHandler);
      },
      removeClickOutsideListener() {
        if (this.clickOutsideHandler) {
          document.removeEventListener('click', this.clickOutsideHandler);
          this.clickOutsideHandler = null;
        }
      },
      toggleTag(tag) {
        const index = this.selectedTags.findIndex(t => t._id === tag._id);
        if (index === -1) {
          this.selectedTags.push(tag);
        } else {
          this.selectedTags.splice(index, 1);
        }
        this.$emit('update:modelValue', [...this.selectedTags]);
      },
      isTagSelected(tag) {
        return this.selectedTags.some(t => t._id === tag._id);
      }
    },
    watch: {
      modelValue: {
        immediate: true,
        handler(newValue) {
          this.selectedTags = [...newValue];
        }
      }
    },
    mounted() {
      this.fetchTags();
    },
    beforeUnmount() {
      this.removeClickOutsideListener();
    }
  };
  </script>
  
  <style scoped>
  .group:hover .invisible {
    visibility: visible;
  }
  </style>