
<template>
  <Suspense>
    <template #default>
      <slot></slot>
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
</script>
