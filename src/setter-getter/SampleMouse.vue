<script setup>
import { useMouse } from '@/composables/useMouse'

const [{ x, y }, { stopTracking }] = useMouse()

const pause = () => stopTracking()
</script>

<template>
  <div>
    Mouse position: {{ x }} × {{ y }}
    <button @click="pause">Pause tracking</button>
  </div>
</template>
