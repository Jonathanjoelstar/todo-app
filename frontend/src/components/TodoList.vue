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

		<div ref="sortableList">
			<transition-group>
				<li v-for="todo in todos" :key="todo._id"
					class="flex items-center p-2 bg-gray-50 rounded-md shadow-sm grid grid-rows-3 grid-cols-4 gap-2">
					<div class="row-start-1 row-span-3 col-start-1 col-span-3 flex items-center">
						<span class="handle cursor-move mr-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
								viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M4 8h16M4 16h16" />
							</svg>
						</span>
						<input type="checkbox" v-model="todo.completed" @change="updateTodo(todo)"
							class="form-checkbox h-5 w-5 text-blue-600" />
						<div :class="selectedTags.length ? 'grid grid-rows-2' : 'flex flex-col'">
							<!-- Titre du todo -->
							<span :class="todo.completed ? 'line-through text-gray-500' : 'text-gray-900'" class="ml-2">
								{{ todo.title }}
							</span>

							<!-- Liste des tags -->
							<div class="row-end-3 flex flex-wrap gap-1 ml-2">
								<span v-for="tag in selectedTags" :key="tag.id" :value="tag.name"
									class="rounded-full text-xs px-2 py-0.5 text-center" :style="{
										color: tag.color,
										backgroundColor: getBackgroundColor(tag.color),
									}">
									{{ tag.name }}
								</span>
							</div>
						</div>
					</div>

					<div class="row-start-1 row-span-3  row-end-4 col-end-5 col-span-1 flex justify-around">
						<TagList v-model="selectedTags" />
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
import TagList from './tags/components/TagList.vue';

export default {
	components: {
		TagList
	},
	data() {
		return {
			todos: [],
			newTodo: '',
			notification: '',
			notificationClass: '',
			hideTag: false,
			selectedTags: []
		};
	},
	methods: {
			getBackgroundColor(color) {
				// Enlève "rgb(" et ")" puis sépare les composants
				const rgbValues = color.match(/\d+/g);
				return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.2)`;
			},
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

;

.hidden {
	visibility: hidden !important;
}
</style>
