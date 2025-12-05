<script setup>
import { useFormField } from './useFormField'

const username = useFormField('', v => v.length < 3 ? 'Too short' : null)
</script>

<template>
  <input :value="username.value" @input="username.set($event.target.value)" />
  <p>{{ username.error }}</p>
</template>
