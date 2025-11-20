
<template>
  <div class="dropdown">
    <button @click="open = !open">{{ label }}</button>
    <ul v-if="open">
      <li v-for="item in items" :key="item" @click="$emit('select', item)">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Menu' },
  items: { type: Array, default: () => [] }
})

const open = ref(false)
</script>

<style scoped>
.dropdown { position: relative; display: inline-block; }
ul { position: absolute; background: white; border: 1px solid #ccc; padding: 0.5rem; list-style: none; }
li { cursor: pointer; padding: 0.25rem 0.5rem; }
li:hover { background: #eee; }
</style>
