<script setup>
import { useRangedValue } from './useRangedValue'

const { value: volume } = useRangedValue(50, 0, 100)
</script>

<template>
  <div>
    <input type="range" v-model.number="volume" :min="0" :max="100" />
    <p>Volume: {{ volume }}%</p>
    <!-- Even if you set volume = 200, it becomes 100 -->
  </div>
</template>
