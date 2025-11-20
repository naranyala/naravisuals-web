
<template>
  <div>
    <input v-model="value" :placeholder="placeholder" />
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: String,
  validator: Function
})

const emit = defineEmits(['update:modelValue'])
const value = ref(props.modelValue)
const error = ref('')

watch(value, val => {
  emit('update:modelValue', val)
  error.value = props.validator ? props.validator(val) : ''
})
</script>
