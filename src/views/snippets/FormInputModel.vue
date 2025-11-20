<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  label: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  options?: { label: string; value: string | number }[] // for select
}>()

const emit = defineEmits(['update:modelValue'])

const update = (e: any) => {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>

    <textarea
      v-if="type === 'textarea'"
      :value="modelValue"
      @input="update"
      :placeholder="placeholder"
      class="input"
    />

    <select
      v-else-if="type === 'select'"
      :value="modelValue"
      @change="update"
      class="input"
    >
      <option value="">Select...</option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >{{ opt.label }}</option>
    </select>

    <input
      v-else
      :type="type || 'text'"
      :value="modelValue"
      @input="update"
      :placeholder="placeholder"
      class="input"
      :class="{ error: !!error }"
    />

    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<style scoped>
.form-group { margin-bottom: 1.2rem; }
label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}
.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
}
.error { border-color: #ef4444; }
.error-text { color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; }
.required { color: #ef4444; }
</style>
