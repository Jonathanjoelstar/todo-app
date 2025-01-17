<template>
	<div>
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
			<select v-model="statusFilter" @change="filterByStatus" class="px-4 py-2 border border-gray-300 rounded-md">
				<option value="">Tous</option>
				<option value="completed">Terminées</option>
				<option value="pending">En cours</option>
			</select>
			<select v-model="selectedTag" @change="filterByTag" class="px-4 py-2 border border-gray-300 rounded-md">
				<option value="">Tous les tags </option>
				<option v-for="tag in availableTags" :key="tag._id" :value="tag._id" >{{ tag.name }}</option>
			</select>
		</div>

		<div ref="sortableList" class="space-y-2">
			<transition-group>
				<li v-for="todo in todos" :key="todo._id"
					class="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm grid grid-cols-6 gap-x-2 mb-2">
					<div class="row-start-1 col-start-1 col-span-5 text-sm flex items-center">
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
							<span :class="{
								'line-through text-gray-500': todo.completed,
								'text-gray-900': !todo.completed
							}" class="ml-2">
								{{ todo.title }}
							</span>
							<!-- Liste des tags -->
							<div class="flex flex-wrap gap-1 ml-2 row-start-2 col-start-1 col-span-5">
								<span v-for="tag in todo.tags" :key="tag._id"
									class="rounded-full text-xs font-normal px-2 pb-0.5 text-justify"
									:style="{ color: tag.color, backgroundColor: getBackgroundColor(tag.color) }">
									{{ tag.name }}
								</span>
							</div>
						</div>
					</div>



					<!-- Gestion des tags et priorités -->
					<div class="row-start-1 row-span-3 row-end-4 col-end-7 col-span-2 flex justify-around">

						<select v-model="todo.priority" @change="updatePriority(todo)"
							class="px-2 py-1 border rounded-md text-sm">
							<option value="low">Basse</option>
							<option value="normal">Normale</option>
							<option value="high">Haute</option>
						</select>

						<!-- Gestionnaire des tags -->
						<TagManager :tags="availableTags" v-model="todo.tags"
							@add-tag="tag => updateTodoTag(todo, tag, 'add')"
							@remove-tag="tag => updateTodoTag(todo, tag, 'remove')" />

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
			selectedTag:'',
			tags: [],
			todosByTag: [],
			todos: [],
			newTodo: '',
			searchQuery: '',
			statusFilter: '',
			notification: '',
			notificationClass: '',
			availableTags: [],
			selectedTagsForTodo: [],
			isTagManagerVisible: false,
			currentTodo: null,
			filteredTodos: [],
			page: 1,  
			itemsPerPage: 10, 
			totalPages: 10,
		};
	},
	watch: {
		statusFilter() {
			this.filterByStatus(); // Applique le filtre chaque fois que la sélection change
		},
	},
	async created() {
		this.fetchTodos();
		this.fetchTags();
	},
	methods: {
		changePage(newPage) {
			if (newPage > 0 && newPage <= this.totalPages) {
				this.page = newPage;
				this.fetchTodos();  // Fetch todos for the new page
			}
		},
		async fetchTodos() {
			try {
				const response = await axios.get('/api/todos', {
					params: {
						page: this.page,
						limit: this.itemsPerPage
					}
				});
				this.todos = response.data;
				console.log('Todo récupérés :', this.todos);
			} catch (error) {
				console.error(error);
				this.showNotification('Erreur lors de la récupération des tâches.', 'bg-red-100 text-red-700');
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
		async updateTodoTag(todo, tag, action) {
			if (!tag || !tag._id || !todo || !todo._id) {
				console.error('Todo ou Tag invalide:', { todo, tag });
				return;
			}

			const url = `/api/todos/${todo._id}/tags`;
			try {
				const response = action === 'add'
					? await axios.post(url, { tagId: tag._id })
					: await axios.delete(url, { data: { tagId: tag._id } });

				// Mettre à jour la liste des tags de la tâche après la réponse de l'API
				todo.tags = response.data.tags || [];
			} catch (error) {
				console.error('Erreur lors de la mise à jour des tags :', error);
			}
		},

		async addTagToTodo(todo, tag) {
			if (todo && tag) {
				// Ajouter localement le tag à la liste
				if (!todo.selectedTags.some(t => t._id === tag._id)) {
					todo.selectedTags.push(tag);
					console.log(`Tag ajouté localement :`, tag);
				}

				// Mise à jour dans le backend
				await this.updateTodoTag(todo, tag, 'add');
			}
		},
		async removeTagFromTodo(todo, tag) {
			if (todo && tag) {
				// Supprimer localement le tag
				todo.selectedTags = todo.selectedTags.filter(t => t._id !== tag._id);
				console.log(`Tag supprimé localement :`, tag);

				// Mise à jour dans le backend
				await this.updateTodoTag(todo, tag, 'remove');
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

		//Filtre par statut
		async filterByStatus() {
			try {
				const response = await axios.get("/api/todos/filter", {
					params: {
						status: this.statusFilter,
					},
				});
				this.todos = response.data.todos;
				this.filteredTodos = this.todos;
			} catch (error) {
				console.error("Erreur lors du filtrage des tâches", error);
			}
		},

		//Filtre par tag
		async filterByTag() {
			console.log("Tag sélectionné:", this.selectedTag);

			if (!this.selectedTag) {
				this.todosByTag = []; // Si aucun tag sélectionné, videz la liste
				return;
			}
			try {
				const response = await axios.get(`/api/todos/by-tag/${this.selectedTag}`);
				this.todosByTag = response.data.todos;
			} catch (error) {
				console.error("Erreur lors du filtrage des tâches par tag", error);
			}
		},

		//Conversion des couleurs pour le background des tags
		getBackgroundColor(color) {
			if (!color || typeof color !== 'string') {
				return 'rgba(0, 0, 0, 0.1)'; // Couleur par défaut
			}


			// Si la couleur est déjà au format rgb ou rgba
			if (/^rgba?\(/.test(color)) {
				const rgb = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
				if (rgb) {
					return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, 0.1)`;
				}
			}

			// Si la couleur est en hexadécimal
			if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
				const hex = color.slice(1);
				const r = parseInt(hex.slice(0, 2), 16);
				const g = parseInt(hex.slice(2, 4), 16);
				const b = parseInt(hex.slice(4, 6), 16);
				return `rgba(${r}, ${g}, ${b}, 0.1)`;
			}

			// Si la couleur est en hsl
			if (/^hsl\(/.test(color)) {
				const hsl = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
				if (hsl) {
					const h = parseInt(hsl[1]);
					const s = parseInt(hsl[2]) / 100;
					const l = parseInt(hsl[3]) / 100;

					// Algorithme pour convertir HSL en RGB
					const c = (1 - Math.abs(2 * l - 1)) * s;
					const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
					const m = l - c / 2;
					let r = 0, g = 0, b = 0;

					if (h >= 0 && h < 60) {
						r = c; g = x; b = 0;
					} else if (h >= 60 && h < 120) {
						r = x; g = c; b = 0;
					} else if (h >= 120 && h < 180) {
						r = 0; g = c; b = x;
					} else if (h >= 180 && h < 240) {
						r = 0; g = x; b = c;
					} else if (h >= 240 && h < 300) {
						r = x; g = 0; b = c;
					} else {
						r = c; g = 0; b = x;
					}

					r = Math.round((r + m) * 255);
					g = Math.round((g + m) * 255);
					b = Math.round((b + m) * 255);

					return `rgba(${r}, ${g}, ${b}, 0.1)`;
				}
			}

			// Si le format de couleur est inconnu
			throw new Error("Format de couleur non supporté");
		}
		,

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
				await axios.patch(`/api/todos/${todo._id}`, { completed: todo.completed });
				this.showNotification('Tâche mise à jour.', 'bg-green-100 text-green-700');
			} catch (error) {
				console.error(error);
				this.showNotification('Erreur lors de la mise à jour de la tâche.', 'bg-red-100 text-red-700');
			}
		},
		async deleteTodo(id) {
			try {
				await axios.delete(`/api/todos/${id}`);
				this.todos = this.todos.filter(todo => todo._id !== id);
				this.showNotification('Tâche supprimée.', 'bg-green-100 text-green-700');
			} catch (error) {
				console.error(error);
				this.showNotification('Erreur lors de la suppression de la tâche.', 'bg-red-100 text-red-700');
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
}

;
</style>
