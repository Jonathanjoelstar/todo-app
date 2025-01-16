<template>
	<div>
		<button @click="toggleDropdown" class="text-gray-500 hover:text-gray-700 focus:outline-none">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
				stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h11M9 21V3m-6 7h.01" />
			</svg>
		</button>

		<div v-if="showDropdown" class="absolute bg-white border rounded-md shadow-md mt-2 w-64 p-2 z-10">
			<div class="flex items-center mb-2">
				<input v-model="newTagName" type="text" placeholder="Ajouter un tag"
					class="flex-grow px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
				<button @click="addTag"
					class="ml-2 bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
					+
				</button>
			</div>

			<ul class="max-h-40 overflow-y-auto">
				<li v-for="tag in tags" :key="tag._id" class="flex items-center justify-between p-1">
					<div class="flex items-center">
						<span class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: tag.color }"></span>
						<span>{{ tag.name }}</span>
					</div>
					<button @click="toggleTag(tag)" class="text-blue-500 hover:underline">
						{{ isTagSelected(tag._id) ? '✓' : '+' }}
					</button>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		tags: {
			type: Array,
			required: true,
		},
		selectedTags: {
			type: Array,
			required: true,
			default: () => [],
		},
	},
	data() {
		return {
			showDropdown: false,
			newTagName: '',
		};
	},

	methods: {
		toggleDropdown() {
			this.showDropdown = !this.showDropdown;
		},
		async toggleTag(tag) {
			if (!tag) {
				console.error('Tag invalide passé à toggleTag:', tag);
				return;
			}

			const isTagSelected = this.selectedTags.includes(tag._id);

			if (isTagSelected) {
				console.log(`Tag déjà présent. Suppression du tag : ${tag.name}`);
				await this.$emit('remove-tag', tag);
			} else {
				console.log(`Tag non présent. Ajout du tag : ${tag.name}`);
				await this.$emit('add-tag', tag);
			}
		}
,

		isTagSelected(tagId) {
			return this.selectedTags.some(t => t._id === tagId);
		},

		addTag() {
			if (this.newTagName.trim() !== '') {
				const newTag = {
					_id: Date.now().toString(), // Simule un ID temporaire
					name: this.newTagName,
					color: this.getRandomColor(),
				};
				this.$emit('add-tag', newTag); // Émettre le nouvel objet tag complet
			} else {
				console.warn('Le nom du tag est vide.');
			}
		},

		getRandomColor() {
			const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC133'];
			return colors[Math.floor(Math.random() * colors.length)];
		},
	},
};
</script>

<style scoped>
.absolute {
	position: absolute;
}
</style>
