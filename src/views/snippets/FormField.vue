
<template>
  <div class="form-field">
    <label>{{ label }}</label>
    <slot />
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  error: { type: String, default: '' }
})
</script>

<style scoped>
.form-field { margin-bottom: 1rem; }
.error { color: red; font-size: 0.8rem; }
</style>
