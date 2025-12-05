<script setup>
import { useFetch } from '@/composables/useFetch'

const [{ data, loading, error }, refetch] = useFetch('https://jsonplaceholder.typicode.com/posts/1')

const reload = () => refetch('https://jsonplaceholder.typicode.com/posts/2')
</script>

<template>
  <div>
    <button @click="refetch">Refresh</button>
    <button @click="reload">Load post #2</button>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>
