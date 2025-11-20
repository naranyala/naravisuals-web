
<script setup>
import { ref } from 'vue';
import { marked } from 'marked';

const content = ref('# Hello, Markdown!');
const compiledMarkdown = ref(marked(content.value));

const updatePreview = () => {
  compiledMarkdown.value = marked(content.value);
};
</script>

<template>
  <div class="markdown-editor">
    <textarea v-model="content" @input="updatePreview"></textarea>
    <div class="preview" v-html="compiledMarkdown"></div>
  </div>
</template>

<style scoped>
.markdown-editor {
  display: flex;
}
.markdown-editor textarea {
  width: 50%;
  height: 300px;
}
.markdown-editor .preview {
  width: 50%;
  padding: 1rem;
  border: 1px solid #ccc;
}
</style>
