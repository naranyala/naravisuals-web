
<template>
  <aside :class="{ open }">
    <button @click="open = !open">{{ open ? 'Close' : 'Open' }}</button>
    <nav v-show="open">
      <slot />
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>

<style scoped>
aside { width: 200px; transition: transform 0.3s; }
aside:not(.open) { transform: translateX(-100%); }
</style>
