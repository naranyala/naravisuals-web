<script setup>
import { useValidation } from './useValidation'

const emailValidator = (str) => /\S+@\S+\.\S+/.test(str)
const { value: email, isValid } = useValidation('', emailValidator)
</script>

<template>
  <div>
    <input v-model="email" placeholder="Enter email" />
    <p :style="{ color: isValid ? 'green' : 'red' }">
      {{ isValid ? 'Valid' : 'Invalid email' }}
    </p>
  </div>
</template>
