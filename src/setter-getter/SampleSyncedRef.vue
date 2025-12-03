<!-- MyInput.vue -->
<script setup>
import { useSyncedRef } from '@/composables/useSyncedRef'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const { value: text } = useSyncedRef(toRef(props, 'modelValue'), emit)
</script>

<template>
  <input v-model="text" />
</template>
