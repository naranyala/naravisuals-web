
<template>
  <div>
    <input type="file" @change="handleFile" />
    <p v-if="file">Selected: {{ file.name }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const file = ref(null)
function handleFile(e) {
  file.value = e.target.files[0]
}
</script>
