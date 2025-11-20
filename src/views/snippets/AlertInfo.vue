<script setup lang="ts">
defineProps<{
  type?: 'success' | 'warning' | 'error' | 'info'
  dismissible?: boolean
  title?: string
}>()

const emit = defineEmits(['close'])
const visible = ref(true)
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="alert" :class="`alert-${type || 'info'}`">
      <div class="alert-icon">!</div>
      <div class="alert-content">
        <strong v-if="title">{{ title }}</strong>
        <slot />
      </div>
      <button v-if="dismissible" @click="visible = false; emit('close')" class="alert-close">×</button>
    </div>
  </Transition>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  gap: 1rem;
}
.alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert-warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
.alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.alert-info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
.alert-close { margin-left: auto; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
