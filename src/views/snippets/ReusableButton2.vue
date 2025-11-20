<template>
  <button 
    :class="['custom-button', variant, size]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot>Default Button</slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.custom-button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.secondary {
  background-color: #6b7280;
  color: white;
}

.danger {
  background-color: #ef4444;
  color: white;
}

.small {
  padding: 6px 12px;
  font-size: 14px;
}

.medium {
  padding: 8px 16px;
  font-size: 16px;
}

.large {
  padding: 12px 24px;
  font-size: 18px;
}

.custom-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-button:hover:not(:disabled) {
  transform: translateY(-1px);
}
</style>
