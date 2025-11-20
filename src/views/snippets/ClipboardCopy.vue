
<template>
  <button @click="copy">{{ copied ? 'Copied!' : 'Copy' }}</button>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: { type: String, required: true }
})

const copied = ref(false)
async function copy() {
  await navigator.clipboard.writeText(props.text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>
