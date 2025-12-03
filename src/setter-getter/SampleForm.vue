<template>
  <form @submit.prevent="submitForm">
    <div>
      <input v-model="formData.fields.email" @input="validateField('email')" />
      <span v-if="formData.errors.email">{{ formData.errors.email }}</span>
    </div>
    <div>
      <input v-model="formData.fields.password" type="password" />
    </div>
    <button type="submit" :disabled="!formData.isValid">Submit</button>
  </form>
</template>

<script setup>
import { useForm } from './useForm'

const formData = useForm({
  email: '',
  password: ''
})

const validators = {
  email: (value) => {
    if (!value) return 'Email is required'
    if (!value.includes('@')) return 'Invalid email'
    return null
  },
  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 6) return 'Password must be at least 6 characters'
    return null
  }
}

function validateField(fieldName) {
  const validator = validators[fieldName]
  if (validator) {
    const error = validator(formData.get(fieldName))
    if (error) {
      formData.setError(fieldName, error)
    }
  }
}

function submitForm() {
  if (formData.validate(validators)) {
    // Submit logic here
    console.log('Form submitted:', formData.fields)
  }
}
</script>
