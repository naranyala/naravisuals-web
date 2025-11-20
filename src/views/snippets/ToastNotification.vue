
<template>
  <div v-if="visible" class="toast">{{ message }}</div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  duration: { type: Number, default: 3000 }
})

const visible = ref(true)

setTimeout(() => visible.value = false, props.duration)
</script>

<style scoped>
.toast {
  position: fixed; bottom: 1rem; right: 1rem;
  background: #42b983; color: white;
  padding: 0.5rem 1rem; border-radius: 4px;
}
</style>
