
<template>
  <div>
    <button @click="visible = !visible">
      {{ visible ? 'Hide' : 'Show' }} Content
    </button>
    <p v-if="visible">Here is some hidden content!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
</script>
