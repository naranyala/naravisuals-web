<template>
  <div v-html="markdownContent" />
</template>

<script>
import marked from 'marked';

export default {
  props: {
    filePath: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      markdownContent: '',
    };
  },
  watch: {
    filePath: {
      immediate: true,
      handler(newPath) {
        this.fetchMarkdown(newPath);
      },
    },
  },
  methods: {
    async fetchMarkdown(path) {
      try {
        const response = await fetch(path);
        const markdown = await response.text();
        this.markdownContent = marked(markdown);
      } catch (error) {
        console.error('Error loading markdown file:', error);
      }
    },
  },
};
</script>
