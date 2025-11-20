
<template>
  <div ref="container" class="scroll-list">
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
    <p v-if="loading">Loading more...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  fetchMore: { type: Function, required: true }
})

const items = ref([])
const loading = ref(false)
const container = ref(null)

async function load() {
  loading.value = true
  const newItems = await props.fetchMore()
  items.value.push(...newItems)
  loading.value = false
}

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) load()
  })
  observer.observe(container.value)
})
</script>

<style scoped>
.scroll-list { max-height: 300px; overflow-y: auto; }
</style>
