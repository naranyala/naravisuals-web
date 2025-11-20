
<script setup>
import { ref } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
});

const selected = ref([]);

const toggleOption = (option) => {
  const index = selected.value.indexOf(option);
  if (index === -1) {
    selected.value.push(option);
  } else {
    selected.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="checkbox-group">
    <label v-for="(option, index) in options" :key="index">
      <input
        type="checkbox"
        :value="option"
        @change="toggleOption(option)"
        :checked="selected.includes(option)"
      />
      {{ option }}
    </label>
  </div>
</template>
