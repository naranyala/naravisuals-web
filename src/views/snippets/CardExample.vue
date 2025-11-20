<template>
  <div :class="['card', shadow, padding]">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  shadow: {
    type: String,
    default: 'medium',
    validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
  },
  padding: {
    type: String,
    default: 'medium',
    validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
  }
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Shadow variants */
.shadow-none {
  box-shadow: none;
}

.shadow-small {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.shadow-medium {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.shadow-large {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Padding variants */
.padding-none .card-body {
  padding: 0;
}

.padding-small .card-body {
  padding: 1rem;
}

.padding-medium .card-body {
  padding: 1.5rem;
}

.padding-large .card-body {
  padding: 2rem;
}
</style>
