
<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal">
      <slot></slot>
      <button @click="close">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['update:show'])

function close() {
  emit('update:show', false)
}
</script>

<style>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: white; padding: 1rem; border-radius: 0.5rem; }
</style>
