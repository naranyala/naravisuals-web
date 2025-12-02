<script setup>
import VennDiagramDemo from "./canvas-engine/VennDiagramDemo.vue"
import EquationDemo from "./canvas-engine/EquationDemo.vue"
import GeometrySample03 from "./canvas-engine/GeometrySample03.vue"
</script>

<template>
  <div class="container">
    <GeometrySample03 />
    <VennDiagramDemo />
    <EquationDemo />
  </div>
</template>

<style scoped>
.container>div {
  border: 1px solid gray;
  border-radius: 20px;
  padding: 40px;
  margin: 40px 0;
}
</style>
