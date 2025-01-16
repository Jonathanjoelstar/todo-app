export default {

  name: "AddTag",
  data() {
    return {
      tag: {
        name: "",
        color: "#000000",
      },
    };
  },
  methods: {

    addTag() {
      if (this.tag.name.trim()) {
        this.$emit("tag-added", { ...this.tag });
        this.tag.name = "";
        this.tag.color = "#000000";
      }
    },
    addTag(tag) {
      if (!this.internalSelectedTags.includes(tag)) {
        this.internalSelectedTags = [...this.internalSelectedTags, tag];
      }
    },
    removeTag(tag) {
      if (this.internalSelectedTags.includes(tag)) {
        this.internalSelectedTags = this.internalSelectedTags.filter(t => t !== tag);
      }
    },
  },
};