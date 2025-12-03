<script setup>
import { useBoolean } from './useBoolean'

const { value: isLoading, setTrue, setFalse } = useBoolean(false)

const fetchData = async () => {
  setTrue()
  await apiCall()
  setFalse()
}
</script>

<template>
  <button @click="fetchData" :disabled="isLoading">
    {{ isLoading ? 'Loading...' : 'Load Data' }}
  </button>
</template>
