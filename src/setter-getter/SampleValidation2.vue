<template>
  <div>
    <input v-model="emailValue" @blur="email.setTouched(true)" :class="{ error: email.hasErrors }" />
    <div v-if="email.isTouched() && email.hasErrors">
      <p v-for="error in email.getErrors()" :key="error">{{ error }}</p>
    </div>
    <button @click="submit" :disabled="!email.isValid">Submit</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useValidation } from './useValidation2'

const emailRules = [
  (value) => !value ? 'Email is required' : null,
  (value) => !/^\S+@\S+\.\S+$/.test(value) ? 'Invalid email format' : null
]

const email = useValidation('', emailRules)

const emailValue = computed({
  get: () => email.get(),
  set: (value) => email.set(value)
})

function submit() {
  email.setTouched(true)
  if (email.isValid) {
    // Submit logic
    console.log('Valid email:', email.get())
  }
}
</script>
