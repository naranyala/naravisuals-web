
<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    default: 'default', // default, easy, medium, hard
    validator: (value) => ['default', 'easy', 'medium', 'hard'].includes(value),
  },
});

const badgeClass = computed(() => `badge badge--${props.difficulty}`);
</script>

<template>
  <span :class="badgeClass">
    {{ label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.25em 0.5em;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  border-radius: 0.25rem;
}

.badge--default {
  background-color: transparent;
  color: inherit;
  border: 1px solid #ccc;
}

.badge--easy {
  background-color: #4caf50; /* Green */
  color: white;
}

.badge--medium {
  background-color: #ff9800; /* Orange */
  color: white;
}

.badge--hard {
  background-color: #f44336; /* Red */
  color: white;
}
</style>
