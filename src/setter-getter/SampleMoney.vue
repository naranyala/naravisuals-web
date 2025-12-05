<script setup>
import { useMoney } from '~/composables/useMoney'

const price = useMoney(12345) // $123.45
</script>

<template>
  <input v-model="price.value">
  <p>Cents: {{ price.raw }}</p>
</template>
