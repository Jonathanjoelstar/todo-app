import axios from "axios";
import Sortable from "sortablejs";
import {
  Listbox,
  ListboxOptions,
  ListboxOption,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/vue";
import { CheckIcon } from "@heroicons/vue/20/solid";
import AddTag from "../components/AddTag.vue";

export default {
  components: {
    Listbox,
    ListboxOptions,
    ListboxOption,
    Popover,
    PopoverButton,
    PopoverPanel,
    CheckIcon,
    AddTag,
  },
  name: "TagList",
  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    internalSelectedTags: {
      get() {
        return this.modelValue || [];
      },
    },
  },
  data() {
    return {
      fetchedTags: [], 
    };
  },
  created() {
    
    this.fetchTags();
  },
  methods: {
    async fetchTags() {
      try {
        const response = await axios.get(`/api/tags`);
        this.fetchedTags = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des tags :", error);
      }
    },
    async toggleTag(tagId) {
      const tag = this.tags.find(t => t._id === tagId);

      if (!tag) {
        console.error('Tag invalide passé à toggleTag:', tagId);
        return;
      }

      const isTagSelected = this.selectedTags.includes(tagId);

      if (isTagSelected) {
        console.log(`Tag déjà présent. Suppression du tag : ${tag.name}`);
        this.$emit('remove-tag', tagId); // Vérifiez ici
      } else {
        console.log(`Tag non présent. Ajout du tag : ${tag.name}`);
        this.$emit('add-tag', tagId); // Vérifiez ici
      }
    },
    getTextColor(color) {
      if (!color || typeof color !== 'string') {
        console.error("Couleur non définie ou incorrecte :", color);
        return '#000'; // Couleur par défaut (noir)
      }
      return color.slice(0, 1) === '#' ? color : `#${color}`;
    },
    getBackgroundColor(color) {
      if (!color || typeof color !== 'string') {
        console.error("Couleur non définie ou incorrecte :", color);
        return '#f0f0f0'; // Couleur par défaut (gris clair)
      }
      return color.slice(0, 1) === '#' ? color + '20' : `#${color}20`; // Transparence ajoutée
    },

    async handleAddTag(newTag) {
      try {
        // Ajoutez à la liste locale ou mettez à jour la base
        this.selectedTags.push(newTag._id);
        console.log('Tag ajouté:', newTag);
      } catch (error) {
        console.error('Erreur lors de l’ajout du tag dans le parent :', error);
      }
    },

    async handleRemoveTag(tagId) {
      try {
        // Retirez le tag localement ou depuis la base
        this.selectedTags = this.selectedTags.filter(id => id !== tagId);
        console.log('Tag supprimé:', tagId);
      } catch (error) {
        console.error('Erreur lors de la suppression du tag dans le parent :', error);
      }
    },

    async addTag(newTag) {
      try {
        const existingTag = this.tags.find((tag) => tag.name === newTag.name);
        if (existingTag) {
          console.warn("Le tag existe déjà :", existingTag);
          return;
        }

        const response = await axios.post("/api/tags", newTag);
        this.tags.push(response.data);
      } catch (error) {
        console.error("Erreur lors de l'ajout du tag :", error);
      }
    },
    async updateTag(tagId, updatedTag) {
      try {
        const response = await axios.patch(`/api/tags/${tagId}`, updatedTag);

        const index = this.tags.findIndex((tag) => tag.id === tagId);
        if (index !== -1) {
          this.$set(this.tags, index, response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la modification du tag :", error);
      }
    },
    async deleteTag(tagId) {
      try {
        await axios.delete(`/api/tags/${tagId}`);
        this.tags = this.tags.filter((tag) => tag.id !== tagId);
      } catch (error) {
        console.error("Erreur lors de la suppression du tag :", error);
      }
    },
  },
};