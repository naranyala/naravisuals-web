<script setup>
const [cameraPermission, { request }] = usePermission('camera')
</script>

<template>
  <button @click="request" :disabled="cameraPermission === 'granted'">
    {{ cameraPermission === 'granted' ? '✓ Camera allowed' : 'Allow Camera' }}
  </button>
</template>
