<script setup>
import { useCapitalized } from './useCapitalized'

const city = useCapitalized()
</script>

<template>
  <input v-model="city.value" placeholder="Type city name">
  <p>Pretty: {{ city.get() }}</p>
</template>
