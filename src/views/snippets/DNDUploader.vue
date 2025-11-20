<script setup lang="ts">
const files = defineModel<File[]>('files', { default: () => [] })
const dragOver = ref(false)

const onDrop = (e: DragEvent) => {
  dragOver.value = false
  if (e.dataTransfer?.files) {
    files.value = [...files.value, ...Array.from(e.dataTransfer.files)]
  }
}
</script>

<template>
  <div 
    class="file-upload"
    :class="{ 'drag-over': dragOver }"
    @drop.prevent="onDrop"
    @dragover.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
  >
    <input type="file" multiple @change="files = [...$event.target.files]" />
    <p>Drag & drop files here or click to browse</p>
    <ul v-if="files.length">
      <li v-for="file in files" :key="file.name">{{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</li>
    </ul>
  </div>
</template>
