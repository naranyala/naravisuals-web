<script setup lang="ts">
const props = defineProps<{
  steps: string[]
  current: number
}>()
</script>

<template>
  <div class="stepper">
    <div v-for="(step, i) in steps" :key="i" class="step" :class="{ active: i === current, completed: i < current }">
      <div class="step-circle">{{ i < current ? '✓' : i + 1 }}</div>
      <div class="step-label">{{ step }}</div>
      <div v-if="i < steps.length - 1" class="step-line"></div>
    </div>
  </div>
</template>

<style scoped>
.stepper { display: flex; align-items: center; }
.step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
.step-circle {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  display: grid; place-items: center;
  font-weight: bold;
  z-index: 1;
}
.step.active .step-circle { background: #3b82f6; color: white; }
.step.completed .step-circle { background: #22c55e; color: white; }
.step-line {
  position: absolute;
  top: 20px; left: 50%;
  width: 100%; height: 4px;
  background: #e5e7eb;
}
.step.completed ~ .step .step-line,
.step.active ~ .step .step-line { background: #e5e7eb; }
.step.completed .step-line { background: #22c55e; }
</style>
