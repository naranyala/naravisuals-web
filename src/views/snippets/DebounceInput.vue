
<template>
  <input :value="modelValue" @input="onInput" />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({ modelValue: String, delay: { type: Number, default: 300 } })
const emit = defineEmits(['update:modelValue'])
const inputValue = ref(props.modelValue)

let timeout
function onInput(e) {
  clearTimeout(timeout)
  timeout = setTimeout(() => emit('update:modelValue', e.target.value), props.delay)
}

watch(() => props.modelValue, val => inputValue.value = val)
</script>
