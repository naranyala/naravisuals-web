<script setup>
const [isOnline] = useOnline()
</script>

<template>
  <div :class="{ 'text-red-500': !isOnline }">
    {{ isOnline ? 'You are online' : 'Offline mode' }}
  </div>
</template>
