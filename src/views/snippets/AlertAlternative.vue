
<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="alert" :class="type">
    {{ message }}
  </div>
</template>

<style scoped>
.alert {
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}
.info {
  background: #d1ecf1;
  color: #0c5460;
}
.success {
  background: #d4edda;
  color: #155724;
}
.warning {
  background: #fff3cd;
  color: #856404;
}
.error {
  background: #f8d7da;
  color: #721c24;
}
</style>
