<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  persistent?: boolean
  maxWidth?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (val) => (isOpen.value = val)
watch(isOpen, (val) => emit('update:modelValue', val))

const close = () => {
  if (!props.persistent) {
    isOpen.value = false
    emit('cancel')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal" :style="{ maxWidth: maxWidth || '500px' }">
          <header class="modal-header">
            <slot name="header">
              <h3>{{ title }}</h3>
            </slot>
            <button class="close-btn" @click="close">×</button>
          </header>

          <div class="modal-body">
            <slot />
          </div>

          <footer class="modal-footer v-if="$slots.footer">
            <slot name="footer">
              <button @click="close">Cancel</button>
              <button class="primary" @click="$emit('confirm')">OK</button>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: pop 0.3s;
}
.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-btn {
  width: 32px; height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-body { padding: 1.5rem; }
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  text-align: right;
  gap: 0.75rem;
  display: flex;
  justify-content: flex-end;
}
.modal-enter-active, .modal-leave-active { transition: all 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.9); }
</style>
