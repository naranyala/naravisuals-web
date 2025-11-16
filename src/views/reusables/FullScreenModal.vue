<template>
  <Teleport to="body">
  <div 
    v-if="isOpen" 
    class="modal-overlay" 
    @click.self="close"
    role="dialog" 
    aria-modal="true"
    :aria-label="ariaLabel"
  >
    <div class="modal-content" ref="modalContent">
      <button class="modal-close" @click="close" aria-label="Close modal">
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024"><path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64"/><path fill="currentColor" d="m237.248 512l265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312z"/></svg>
        <span class="close-text">Back</span>
      </button>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits, computed, onMounted, onUnmounted, watch, ref } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  ariaLabel: { type: String, default: 'Modal dialog' }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const modalContent = ref(null)

function close() {
  isOpen.value = false
}

function handleEscape(e) {
  if (e.key === 'Escape') close()
}

function trapFocus(e) {
  if (e.key !== 'Tab' || !modalContent.value) return
  
  const focusable = modalContent.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(isOpen, (open) => {
  if (open) {
    document.body.classList.add('no-scroll')
    document.addEventListener('keydown', handleEscape)
    modalContent.value?.addEventListener('keydown', trapFocus)
  } else {
    document.body.classList.remove('no-scroll')
    document.removeEventListener('keydown', handleEscape)
    modalContent.value?.removeEventListener('keydown', trapFocus)
  }
})

onUnmounted(() => {
  document.body.classList.remove('no-scroll')
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000000e6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 100%;
  max-height: 90vh;
  background: #1a1a1a;
  color: #e5e5e5;
  overflow-y: auto;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #333;
  box-shadow: 0 20px 40px #00000080;
}

.modal-close {
  position: sticky;
  top: 1rem;
  left: 1rem;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #e5e5e5;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  z-index: 1;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #3a3a3a;
  border-color: #666;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }
  
  .modal-content {
    max-width: 100%;
    max-height: 100vh;
    padding: 1rem;
    border-radius: 0;
    border: none;
  }
  
  .modal-close {
    padding: 1rem;
  }
}
</style>

<style>
.no-scroll {
  overflow: hidden;
}
</style>
