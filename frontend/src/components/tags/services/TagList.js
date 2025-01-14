import axios from "axios";
import Sortable from "sortablejs";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/vue";
import { CheckIcon } from "@heroicons/vue/20/solid";

export default {
  components: {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    Popover,
    PopoverButton,
    PopoverPanel,
    CheckIcon,
  },
  name: "TagList",
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    selectedTags: {
      get() {
        return this.modelValue;
      },
      set(newValues) {
        this.$emit("update:modelValue", newValues);
      },
    },
  },
  data() {
    return {
      tags:[],
      categories:[],
    };
  },
  created() {
  this.fetchTags();
  this.fetchCategorie()
  },
  methods: {
     // Récupérer toute les categories depuis le serveur
  async fetchCategorie() {
    try {
      const response = await axios.get(`/api/categories`);
      this.categories = response.data; // Assurez-vous que la réponse contient un tableau de tags
    } catch (error) {
      console.error("Erreur lors de la récupération des tags :", error);
    }
  },

  // Récupérer tous les tags depuis le serveur
  async fetchTags() {
    try {
      const response = await axios.get(`/api/tags`);
      this.tags = response.data; // Assurez-vous que la réponse contient un tableau de tags
    } catch (error) {
      console.error("Erreur lors de la récupération des tags :", error);
    }
  },

  // Ajouter un nouveau tag
  async addTag(newTag) {
    try {
      const response = await axios.post("/api/tags", newTag);
      this.tags.push(response.data); // Ajout du tag créé au tableau local
    } catch (error) {
      console.error("Erreur lors de l'ajout du tag :", error);
    }
  },

  // Modifier un tag existant
  async updateTag(tagId, updatedTag) {
    try {
      const response = await axios.patch(`/api/tags/${tagId}`, updatedTag);
      // Mettre à jour le tag localement
      const index = this.tags.findIndex((tag) => tag.id === tagId);
      if (index !== -1) {
        this.$set(this.tags, index, response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la modification du tag :", error);
    }
  },

  // Supprimer un tag
  async deleteTag(tagId) {
    try {
      await axios.delete(`/api/tags/${tagId}`);
      // Supprimer le tag localement
      this.tags = this.tags.filter((tag) => tag.id !== tagId);
    } catch (error) {
      console.error("Erreur lors de la suppression du tag :", error);
    }
  },
},
  
}