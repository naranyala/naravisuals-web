
<template>
  <div class="card">
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</template>

<script setup>
</script>

<style>
.card { border: 1px solid #ccc; border-radius: 0.5rem; padding: 1rem; background: #fff; }
</style>
