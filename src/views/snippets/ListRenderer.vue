
<template>
  <div>
    <ul>
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>
    <button @click="addItem">Add Item</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref(['Item 1', 'Item 2', 'Item 3'])

function addItem() {
  items.value.push(`Item ${items.value.length + 1}`)
}
</script>
