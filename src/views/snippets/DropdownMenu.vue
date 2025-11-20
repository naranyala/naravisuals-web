<script setup lang="ts">
import { ref, { onClickOutside } from 'vue'

const props = defineProps<{
  trigger: 'click' | 'hover'
  label?: string
}>()

const open = ref(false)
const dropdownRef = ref(null)

onClickOutside(dropdownRef, () => open.value = false)

const toggle = () => {
  if (props.trigger === 'click') open.value = !open.value
}
</script>

<template>
  <div class="dropdown" ref="dropdownRef" @mouseenter="trigger === 'hover' && (open = true)" @mouseleave="trigger === 'hover' && (open = false)">
    <button class="dropdown-trigger" @click="toggle">
      <slot name="trigger">
        {{ label || 'Menu' }} ▼
      </slot>
    </button>

    <Transition name="dropdown">
      <ul v-if="open" class="dropdown-menu">
        <slot />
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown { position: relative; display: inline-block; }
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  min-width: 200px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 0.5rem 0;
  z-index: 1000;
  list-style: none;
}
.dropdown-menu li { padding: 0.75rem 1rem; cursor: pointer; }
.dropdown-menu li:hover { background: #f3f4f6; }
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
