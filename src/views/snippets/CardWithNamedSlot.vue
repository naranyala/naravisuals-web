<script setup>
defineProps({
  title: String,
  loading: Boolean
})
</script>

<template>
  <div class="card">
    <header v-if="$slots.header || title">
      <slot name="header">
        <h3>{{ title }}</h3>
      </slot>
    </header>

    <div class="card-body">
      <slot v-if="!loading" />
      <div v-else class="skeleton">Loading...</div>
    </div>

    <footer v-if="$slots.footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.card-body { padding: 1rem; }
header, footer { background: #f8f9fa; padding: 1rem; }
.skeleton { background: #eee; height: 100px; border-radius: 8px; }
</style>
