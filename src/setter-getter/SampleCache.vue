<template>
  <div>
    <button @click="fetchData">Fetch Data</button>
    <button @click="clearCache">Clear Cache</button>
    <p>Cached items: {{ cache.getSize() }}</p>
    <ul>
      <li v-for="key in cache.getKeys()" :key="key">
        {{ key }}: {{ cache.get(key) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useCache } from './useCache'

const cache = useCache(60000) // 1 minute TTL

const memoizedFetch = cache.memoize(async (id) => {
  const response = await fetch(`/api/data/${id}`)
  return response.json()
}, 30000) // 30 seconds for this function

async function fetchData() {
  const data = await memoizedFetch(1)
  console.log('Data:', data)
}

function clearCache() {
  cache.clear()
}
</script>
