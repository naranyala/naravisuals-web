<script setup>
import { useRegex } from './useRegex'

const pin = useRegex('', /^\d{0,4}$/)
</script>

<template>
  <input v-model="pin.value" maxlength="4" placeholder="4-digit pin">
  <p>Pin: {{ pin.get() }}</p>
</template>
