<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024"><path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64"/><path fill="currentColor" d="m237.248 512l265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312z"/></svg>
        <div>Back</div>
      </button>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function close() {
  isOpen.value = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw; /* full width */
  height: 100vh; /* full height */
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: stretch; /* stretch modal to fill height */
  justify-content: stretch; /* stretch modal to fill width */
  z-index: 99999;
}

.modal-content {
  position: relative;
  width: 100%;
  height: 100%;
  background: #121212;
  color: #fff;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #ff6b6b;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}
</style>

