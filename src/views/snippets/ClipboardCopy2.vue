<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ text: string }>()
const copied = ref(false)

const copy = async () => {
  await navigator.clipboard.writeText(props.text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <button @click="copy" class="copy-btn">
    {{ copied ? 'Copied!' : 'Copy' }}
  </button>
</template>
