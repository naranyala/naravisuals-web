<template>
  <div :class="['spinner', size, variant]" :style="style"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white'].includes(value)
  },
  color: {
    type: String,
    default: ''
  }
})

const style = computed(() => {
  if (props.color) {
    return {
      borderColor: `${props.color} transparent transparent transparent`
    }
  }
  return {}
})
</script>

<style scoped>
.spinner {
  border-style: solid;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.medium {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.large {
  width: 32px;
  height: 32px;
  border-width: 4px;
}

.primary {
  border-color: #3b82f6 transparent transparent transparent;
}

.secondary {
  border-color: #6b7280 transparent transparent transparent;
}

.white {
  border-color: white transparent transparent transparent;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
