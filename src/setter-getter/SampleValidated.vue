<script setup>
import { useValidated } from './useValidated'

const email = useValidated('', v =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Bad e-mail'
)
</script>

<template>
  <input v-model="email.value">
  <p v-if="email.error" style="color:red">{{ email.error }}</p>
</template>
