
<template>
  <div>
    <p>Initial: {{ initialValue }}</p>
    <button @click="count++">Count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  initialValue: {
    type: Number,
    default: 0
  }
})

const count = ref(props.initialValue)
</script>
