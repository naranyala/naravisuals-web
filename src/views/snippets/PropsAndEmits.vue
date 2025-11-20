<script setup>
const props = defineProps({
  modelValue: String,
  label: String
})

const emit = defineEmits(['update:modelValue', 'click'])

const updateValue = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <label>
    {{ label }}
    <input 
      :value="modelValue" 
      @input="updateValue"
      @click="$emit('click')"
    />
  </label>
</template>
