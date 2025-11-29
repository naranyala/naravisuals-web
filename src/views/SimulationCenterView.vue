<script setup>
// import RandomCanvas from "./simulation/RandomCanvas.vue"
// import DemoLinearAlgebra from "./simulation/DemoLinearAlgebra.vue"
// import DemoBouncingBalls from "./simulation/DemoBouncingBalls.vue"

import Calculation2D from "./simulation/Calculation2D.vue"
import Calculation3D from "./simulation/Calculation3D.vue"

import MathVisuals01 from "./simulation/MathVisuals01.vue"
import MathVisuals02 from "./simulation/MathVisuals02.vue"
import MathVisuals03 from "./simulation/MathVisuals03.vue"
import MathVisuals04 from "./simulation/MathVisuals04.vue"

import CubeVisuals01 from "./simulation/CubeVisuals01.vue"
import CubeVisuals02 from "./simulation/CubeVisuals02.vue"
import CubeVisuals03 from "./simulation/CubeVisuals03.vue"
import CubeVisuals04 from "./simulation/CubeVisuals04.vue"

import Shapes2D from "./simulation/Shapes2D.vue"
import Shapes3D from "./simulation/Shapes3D.vue"

</script>

<template>
  <h1>simulation only</h1>

  <div class="container">
    <!-- <RandomCanvas/> -->
    <!-- <DemoLinearAlgebra/> -->
    <!-- <DemoBouncingBalls/> -->
    <!-- <CubeVisuals03/> -->
    <!-- <MathVisuals04/> -->

    <Calculation2D />
    <Calculation3D />

    <CubeVisuals01 />
    <CubeVisuals02 />
    <CubeVisuals04 />

    <MathVisuals01 />
    <MathVisuals02 />
    <MathVisuals03 />

    <Shapes2D />
    <Shapes3D />


    <!-- END LIST -->
  </div>
</template>

<style scoped>
.container div {
  border: 1px solid gray;
  border-radius: 20px;
  margin: 40px 0;
  padding: 40px;
}
</style>
