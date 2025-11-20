
<template>
  <div>
    <p v-if="loading">Loading...</p>
    <ul v-else>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])
const loading = ref(true)

onMounted(async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  items.value = await res.json()
  loading.value = false
})
</script>
