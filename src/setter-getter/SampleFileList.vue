<script setup>
import { useFileList } from './useFileList'

const photos = useFileList()

function onDrop(e) {
  photos.add(...e.dataTransfer.files)
}
</script>

<template>
  <div @drop.prevent="onDrop" @dragover.prevent style="padding:2rem;border:2px dashed #888">
    Drop images here
  </div>
  <p>Count: {{ photos.get().length }}</p>
  <button @click="photos.clear">Clear</button>
</template>
