<script setup>

import { useDragAndDrop } from "./useDragAndDrop.js"

const [{ isDragging, files }, { onDragOver, onDragLeave, onDrop }] = useDragAndDrop()

watch(files, () => files.value.length && upload(files.value))
</script>

<template>
  <div @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop"
    :class="{ 'border-blue-500 bg-blue-50': isDragging }" class="border-4 border-dashed p-10">
    {{ isDragging ? 'Drop it!' : 'Drag files here' }}
    <div v-if="files.length">{{ files.length }} files ready</div>
  </div>
</template>
