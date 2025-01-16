<template>
	<div>
		<!-- Formulaire pour ajouter une tâche -->
		<form @submit.prevent="addTodo" class="flex mb-4">
			<input v-model="newTodo" type="text" placeholder="Ajouter une tâche"
				class="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
			<button type="submit"
				class="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
				Ajouter
			</button>
		</form>

		<!-- Recherche et Filtrage -->
		<div class="flex gap-4 mb-4">
			<input v-model="searchQuery" type="text" placeholder="Rechercher..."
				class="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
			<select v-model="filterStatus" class="px-4 py-2 border border-gray-300 rounded-md">
				<option value="">Tous</option>
				<option value="completed">Terminées</option>
				<option value="pending">En attente</option>
			</select>
			<select v-model="filterTag" class="px-4 py-2 border border-gray-300 rounded-md">
				<option value="">Tous les tags</option>
				<option v-for="tag in availableTags" :key="tag._id" :value="tag._id">{{ tag.name }}</option>
			</select>
			<button @click="applyFilters"
				class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
				Filtrer
			</button>
		</div>

		<!-- Liste des tâches -->
		<div ref="sortableList">
			<transition-group tag="ul" name="list">
				<li v-for="todo in todos" :key="todo._id"
					class="flex items-center p-2 bg-gray-50 rounded-md shadow-sm grid grid-cols-5 gap-x-2 mb-2">
					<!-- Contenu principal de la tâche -->
					<div class="row-start-1 row-span-3 col-start-1 col-span-4 text-sm flex items-center">
						<span class="handle cursor-move mr-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
								viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M4 8h16M4 16h16" />
							</svg>
						</span>
						<input type="checkbox" v-model="todo.completed" @change="updateTodo(todo)"
							class="form-checkbox h-5 w-5 text-blue-600" />
						<div>
							<span :class="todo.completed ? 'line-through text-gray-500' : 'text-gray-900'"
								class="flex ml-2 font-semibold text-sm">
								{{ todo.title }} ({{ todo.priority || 'Normale' }})
							</span>
							<!-- Liste des tags -->
							<div class="flex flex-wrap gap-1 ml-2">
								<span v-for="tag in todo.selectedTags" :key="tag._id"
									class="rounded-full text-xs font-normal px-2 pb-0.5 text-justify"
									:style="{ color: tag.color, backgroundColor: getBackgroundColor(tag.color)}">
									{{ tag.name }}
								</span>
							</div>
						</div>
					</div>

					<!-- Gestion des tags et priorités -->
					<div class="row-start-1 row-span-3 row-end-4 col-end-6 col-span-1 flex justify-around">
						<button @click="openTagManager(todo)"
							class="text-gray-500 hover:text-blue-500 focus:outline-none">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
								stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M3 7h18M6 10h12M9 13h6" />
							</svg>
						</button>
						<select v-model="todo.priority" @change="updatePriority(todo)"
							class="px-2 py-1 border rounded-md text-sm">
							<option value="low">Basse</option>
							<option value="normal">Normale</option>
							<option value="high">Haute</option>
						</select>
						<button @click="deleteTodo(todo._id)"
							class="text-red-500 hover:text-red-700 focus:outline-none">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
								stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</li>
			</transition-group>
		</div>

		<!-- Gestionnaire des tags -->
		<TagManager :tags="availableTags" :selected-tags="currentTodo?.selectedTags.map(tag => tag._id) || []"
			@add-tag="addTagToTodo(currentTodo, $event)" @remove-tag="removeTagFromTodo(currentTodo, $event)" />
	</div>
</template>

<script>
import axios from 'axios';
import Sortable from 'sortablejs';
import TagManager from './tags/components/TagManager.vue';

export default {
	components: { TagManager },
	data() {
		return {
			todos: [],
			newTodo: '',
			searchQuery: '',
			filterStatus: '',
			filterTag: '',
			notification: '',
			notificationClass: '',
			availableTags: [],
			selectedTagsForTodo: [],
			isTagManagerVisible: false,
			currentTodo: null,
		};
	},
	methods: {
		async handleAddTag(tagId) {
			try {
				const response = await axios.post(`/api/todos/${this.todo._id}/tags`, { tagId });
				console.log('Réponse du backend après ajout :', response.data);
				this.todo.selectedTags = response.data.tags;
			} catch (error) {
				console.error('Erreur lors de l\'ajout du tag :', error);
			}
		},

async handleRemoveTag(tagId) {
			try {
				const response = await axios.delete(`/api/todos/${this.todo._id}/tags`, { data: { tagId } });
				console.log('Réponse du backend après suppression :', response.data);
				this.todo.selectedTags = response.data.tags;
			} catch (error) {
				console.error('Erreur lors de la suppression du tag :', error);
			}
		},
		async fetchTodos() {
  try {
    const response = await axios.get('/api/todos');
	  this.todos = response.data.map(todo => ({
		  ...todo,
		  selectedTags: todo.selectedTags || [], // Initialisation des tags si undefined
	  }));
    console.log('Tâches récupérées :', this.todos);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches :', error);
  }
},
async fetchTags() {
  try {
    const response = await axios.get('/api/tags');
    this.availableTags = response.data;
    console.log('Tags récupérés :', this.availableTags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags :', error);
  }
},

		openTagManager(todo) {
			
			console.log('Méthode openTagManager appelée.', todo);
			if (!todo) {
				console.error('Erreur : aucun todo fourni à openTagManager.');
				return;
			}
			this.currentTodo = todo;
			this.selectedTagsForTodo = todo.selectedTags || []; // Initialiser si undefined
			this.isTagManagerVisible = true;

			console.log('Tags disponibles :', this.availableTags);
			console.log('Tags sélectionnés pour la tâche :', this.selectedTagsForTodo);
		},
		closeTagManager() {
			this.isTagManagerVisible = false;
			this.currentTodo = null;
		},
		async addNewTag(tag) {
			try {
				const response = await axios.post(`/api/tags`, tag);
				console.log('Nouveau tag ajouté au backend :', response.data);

				// Ajouter le nouveau tag localement
				this.tags.push(response.data);
			} catch (error) {
				console.error('Erreur lors de l\'ajout d\'un nouveau tag au backend :', error.response?.data || error.message);
			}
		},
		async addTodo() {
			if (!this.newTodo) return;
			try {
				const response = await axios.post('/api/todos', { title: this.newTodo });
				this.todos.push(response.data);
				this.newTodo = '';
			} catch (error) {
				console.error('Erreur lors de l\'ajout de la tâche : ', error);
			}
		},
		async deleteTodo(id) {
			try {
				await axios.delete(`/api/todos/${id}`);
				this.todos = this.todos.filter(todo => todo._id !== id);
			} catch (error) {
				console.error('Erreur lors de la suppression de la tâche :', error);
			}
		},
		async updateTodo(todo) {
			try {
				await axios.patch(`/api/todos/${todo._id}`, { completed: todo.completed });
			} catch (error) {
				console.error('Erreur lors de la mise à jour de la tâche :', error);
			}
		},
		
		async addTagToTodo(todo, tag) {
			if (!tag || !tag._id) {
				console.error('Tag invalide passé à addTagToTodo:', tag);
				return;
			}

			console.log('Tag valide trouvé :', tag);

			try {
				const response = await axios.post(`/api/todos/${todo._id}/tags`, { tagId: tag._id });

				console.log('Réponse de l\'API après ajout du tag :', response.data);

				if (response.data.tags) {
					todo.selectedTags = response.data.tags;
				} else {
					console.error('Réponse inattendue de l\'API : pas de tags retournés.');
				}

				console.log(`Tag \"${tag.name}\" ajouté avec succès.`);
			} catch (error) {
				console.error('Erreur lors de l\'ajout du tag :', error.response?.data || error.message);
			}
			try {
				const response = await axios.post(`/api/todos/${this.todo._id}/tags`, { tagId });
				console.log('Tag ajouté avec succès au backend :', response.data);

				// Mettre à jour les tags locaux
				this.todo.selectedTags = response.data.selectedTags;
			} catch (error) {
				console.error('Erreur lors de l\'ajout du tag au backend :', error.response?.data || error.message);
			}
		
		},

		async removeTagFromTodo(todo, tag) {
			if (!tag || !tag._id) {
				console.error('Tag invalide passé à removeTagFromTodo:', tag);
				return;
			}

			console.log('Suppression du tag :', tag);

			try {
				const response = await axios.delete(`/api/todos/${todo._id}/tags`, { data: { tagId: tag._id } });

				console.log('Réponse de l\'API après suppression du tag :', response.data);

				if (response.data.tags) {
					todo.selectedTags = response.data.tags;
				} else {
					console.error('Réponse inattendue de l\'API : pas de tags retournés.');
				}

				console.log(`Tag \"${tag.name}\" supprimé avec succès.`);
			} catch (error) {
				console.error('Erreur lors de la suppression du tag :', error.response?.data || error.message);
			}
			try {
				const response = await axios.delete(`/api/todos/${this.todo._id}/tags`, { data: { tagId } });
				console.log('Tag supprimé avec succès du backend :', response.data);

				// Mettre à jour les tags locaux
				this.todo.selectedTags = response.data.selectedTags;
			} catch (error) {
				console.error('Erreur lors de la suppression du tag au backend :', error.response?.data || error.message);
			}
		},

		async applyFilters() {
			try {
				let url = '/api/todos/filter?';
				if (this.searchQuery) url += `search=${encodeURIComponent(this.searchQuery)}&`;
				if (this.filterStatus) url += `status=${encodeURIComponent(this.filterStatus)}&`;
				if (this.filterTag) url += `tag=${encodeURIComponent(this.filterTag)}&`;

				const response = await axios.get(url);
				this.todos = response.data;
			} catch (error) {
				console.error('Erreur lors de l\'application des filtres :', error);
			}
		},

		async updatePriority(todo) {
			try {
				await axios.patch(`/api/todos/${todo._id}/priority`, { priority: todo.priority });
				console.log('Priorité mise à jour pour la tâche :', todo);
			} catch (error) {
				console.error('Erreur lors de la mise à jour de la priorité :', error);
			}
		},
		openTagManager(todo) {
			this.currentTodo = todo;
			this.selectedTagsForTodo = todo.selectedTags;
			this.isTagManagerVisible = true;
		},
		closeTagManager() {
			this.isTagManagerVisible = false;
			this.currentTodo = null;
		},
		getBackgroundColor(color) {
			if (!color || typeof color !== 'string') {
				// Si la couleur est indéfinie ou non valide, retournez une couleur par défaut
				return 'rgba(0, 0, 0, 0.1)'; // Exemple de couleur par défaut
			}

			const isRgba = color.startsWith('rgba');
			const isRgb = color.startsWith('rgb') && !isRgba;

			if (isRgb) {
				const rgbValues = color.match(/\d+/g); // Extrait les valeurs numériques
				return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.1)`;
			}

			if (isRgba) {
				const rgbaValues = color.match(/\d+(\.\d+)?/g); // Extrait les valeurs numériques
				return `rgba(${rgbaValues[0]}, ${rgbaValues[1]}, ${rgbaValues[2]}, 0.1)`;
			}

			return color; // Retournez la couleur originale si elle n'est pas au format attendu
		},
	},
	mounted() {
		this.fetchTodos();
		this.fetchTags();
		Sortable.create(this.$refs.sortableList, {
			handle: '.handle',
			animation: 150,
			onEnd: this.onDragEnd,
		});
	},
};
</script>

<style scoped>
.handle {
	display: flex;
	align-items: center;
};

.hidden {
	visibility: hidden !important;
}
</style>
