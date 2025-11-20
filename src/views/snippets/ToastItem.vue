<!-- ToastItem.vue -->
<template>
  <div :class="['toast', type]" @click="$emit('remove', toast.id)">
    <div class="toast-content">
      <span class="toast-message">{{ toast.message }}</span>
      <button class="toast-close" @click.stop="$emit('remove', toast.id)">
        ×
      </button>
    </div>
    <div v-if="toast.duration > 0" class="toast-progress">
      <div class="toast-progress-bar" :style="progressStyle"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

defineProps({
  toast: {
    type: Object,
    required: true
  }
})

defineEmits(['remove'])

const startTime = ref(Date.now())
const elapsed = ref(0)

const progressStyle = computed(() => {
  const progress = (elapsed.value / toast.duration) * 100
  return {
    width: `${100 - progress}%`
  }
})

onMounted(() => {
  const updateProgress = () => {
    elapsed.value = Date.now() - startTime.value
    if (elapsed.value < toast.duration) {
      requestAnimationFrame(updateProgress)
    }
  }
  requestAnimationFrame(updateProgress)
})
</script>

<style scoped>
.toast {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #6b7280;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.toast:hover {
  transform: translateY(-2px);
}

.toast.info {
  border-left-color: #3b82f6;
}

.toast.success {
  border-left-color: #10b981;
}

.toast.warning {
  border-left-color: #f59e0b;
}

.toast.error {
  border-left-color: #ef4444;
}

.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #6b7280;
}

.toast-close:hover {
  background-color: #f3f4f6;
}

.toast-progress {
  height: 3px;
  background-color: #f3f4f6;
}

.toast-progress-bar {
  height: 100%;
  background-color: currentColor;
  transition: width 16ms linear;
}
</style>
