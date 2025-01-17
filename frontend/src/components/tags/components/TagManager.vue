<template>
	<div class="w-1/8 flex relative">
		<Popover class="relative">
			<!-- Popover Button -->
			<PopoverButton class="outline-none">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="gray"
					preserveAspectRatio="none" class="h-6 w-6 -skew-x-[5deg] -skew-y-[10deg] scale-[0.8]">
					<path stroke-linecap="round" stroke-linejoin="round"
						d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
				</svg>
			</PopoverButton>

			<!-- Popover Panel -->
			<PopoverPanel
				class="absolute -right-0 top-10 z-10 p-4 bg-white rounded-lg shadow-lg w-64 text-blue-gray-500 shadow-blue-gray-500/10 border">
				<form class="flex flex-row justify-between mb-4" @submit.prevent="addTag()">
					<!-- Input for option name -->
					<input type="text" v-model="newTagName" placeholder="Ajouter une option"
						class="pl-2 rounded outline-none border border-gray-200 text-left w-9/12" />
					<!-- Input for option color -->
					<input type="color" v-model="newTagColor" class="border w-1/12" />
					<!-- Submit button -->
					<button type="submit" class="text-green-500 w-1/12">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
							stroke="currentColor" class="h-5 w-5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</button>
				</form>

				<!-- Listbox for options -->
				<Listbox v-model="internalSelectedTags" multiple>
					<ListboxOptions class="max-h-40 w-full overflow-auto scrollbar" static>
						<ListboxOption as="template" v-slot="{ selected }" v-for="tag in allTags" :key="tag._id"
							:value="tag">
							<li class="cursor-pointer select-none py-2 pl-3 pr-9">
								<div class="flex items-center space-x-2">
									<span :style="{ backgroundColor: tag.color }"
										class="inline-block w-4 h-4 rounded-full"></span>
									<span>{{ tag.name }}</span>
									<CheckIcon v-show="selected" class="w-4 h-4 text-blue-500" />
								</div>
							</li>
						</ListboxOption>
					</ListboxOptions>
				</Listbox>
			</PopoverPanel>
		</Popover>
	</div>
</template>

<script>
import {
	Popover,
	PopoverButton,
	PopoverPanel,
	Listbox,
	ListboxOptions,
	ListboxOption,
} from "@headlessui/vue";
import { CheckIcon } from "@heroicons/vue/24/outline";
import axios from "axios";

export default {
	emits: ["add-tag", "remove-tag"],
	components: {
		Popover,
		PopoverButton,
		PopoverPanel,
		Listbox,
		ListboxOptions,
		ListboxOption,
		CheckIcon,
	},
	props: {
		value: {
			type: Array,
			default: () => [],
		},
	},
	emits: ["update:modelValue", "add-tag", "remove-tag"],
	data() {
		return {
			newTagName: "",
			newTagColor: "#0000F6",
			internalSelectedTags: [...this.value],
		};
	},
	async created() {
		this.fetchTags();
	},
	watch: {
		value(newValue) {
			this.internalSelectedTags = [...newValue]; // Synchroniser avec les tags sélectionnés
		},
		internalSelectedTags: {
			handler(newValue, oldValue) {
				// Identifiez les tags ajoutés
				const addedTags = newValue.filter(tag => !oldValue.some(t => t._id === tag._id));
				// Identifiez les tags supprimés
				const removedTags = oldValue.filter(tag => !newValue.some(t => t._id === tag._id));

				// Émettre les événements correspondants
				addedTags.forEach(tag => {
					if (tag && tag._id) this.$emit("add-tag", tag);  // Vérification de l'objet tag
				});
				removedTags.forEach(tag => {
					if (tag && tag._id) this.$emit("remove-tag", tag); // Vérification de l'objet tag
				});

				// Émet une mise à jour globale de modelValue
				this.$emit("update:modelValue", newValue);
			},
			deep: true,
		},
	},
	methods: {
		async fetchTags() {
			try {
				const response = await axios.get('/api/tags');
				this.allTags = response.data;
				console.log('Tags récupérés :', this.allTags);
			} catch (error) {
				console.error('Erreur lors de la récupération des tags :', error);
			}
		},
		async addTag() {
			if (this.newTagName.trim()) {
				const newTag = {
					name: this.newTagName,
					color: this.newTagColor,
				};

				// Vérifier si le tag existe déjà
				const tagExists = this.tagsList.some(tag => tag.name === this.newTagName.trim());
				if (tagExists) {
					alert("Le tag existe déjà !");
					return;  // Ne pas ajouter le tag si il existe déjà
				}

				try {
					const response = await axios.post("/api/tags", newTag);

					// Ajouter le tag à la liste locale
					this.tagsList.push(response.data);  // Mettre à jour la liste des tags

					// Émettre l'événement pour informer les autres composants
					this.$emit("add-tag", response.data);

					// Réinitialiser les champs de saisie
					this.newTagName = "";
					this.newTagColor = "#0000F6";  // Couleur par défaut
				} catch (error) {
					console.error("Erreur lors de l'ajout du tag :", error);
				}
			}
		}

	},
};
</script>
