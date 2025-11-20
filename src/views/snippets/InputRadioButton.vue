
<script setup>
import { ref } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
});

const selected = ref(null);
</script>

<template>
  <div class="radio-group">
    <label v-for="(option, index) in options" :key="index">
      <input
        type="radio"
        :value="option"
        v-model="selected"
      />
      {{ option }}
    </label>
  </div>
</template>
