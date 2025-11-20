
<template>
  <div v-if="show" class="overlay" @click.self="close">
    <div class="modal">
      <slot />
      <button @click="close">Close</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: white; padding: 1rem; border-radius: 8px;
}
</style>
