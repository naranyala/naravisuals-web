
<template>
  <input type="date" v-model="date" @change="$emit('update:modelValue', date)" />
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const date = ref(props.modelValue)
</script>
