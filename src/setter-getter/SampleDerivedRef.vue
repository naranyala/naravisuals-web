<script setup>
import { useDerivedState } from './useDerivedState'


// helpers
const formatPhone = (str) => {
  const digits = str.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

const parsePhone = (formatted) => formatted.replace(/\D/g, '')

const { value: phoneNumber } = useDerivedState('', {
  format: formatPhone,
  parse: parsePhone
})
</script>

<template>
  <input v-model="phoneNumber" placeholder="(123) 456-7890" />
  <!-- User types "1234567890" → displays as "(123) 456-7890"
       User edits display → raw updates correctly -->
</template>
