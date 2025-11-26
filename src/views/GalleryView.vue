<script setup>
// import RandomCanvas from "./gallery/RandomCanvas.vue"
// import DemoLinearAlgebra from "./gallery/DemoLinearAlgebra.vue"
// import DemoBouncingBalls from "./gallery/DemoBouncingBalls.vue"

import Calculation2D from "./gallery/Calculation2D.vue"
import Calculation3D from "./gallery/Calculation3D.vue"

import MathVisuals01 from "./gallery/MathVisuals01.vue"
import MathVisuals02 from "./gallery/MathVisuals02.vue"
import MathVisuals03 from "./gallery/MathVisuals03.vue"
import MathVisuals04 from "./gallery/MathVisuals04.vue"

import CubeVisuals01 from "./gallery/CubeVisuals01.vue"
import CubeVisuals02 from "./gallery/CubeVisuals02.vue"
import CubeVisuals03 from "./gallery/CubeVisuals03.vue"
import CubeVisuals04 from "./gallery/CubeVisuals04.vue"

import Shapes2D from "./gallery/Shapes2D.vue"
import Shapes3D from "./gallery/Shapes3D.vue"

</script>

<template>
  <h1>MY GALLERY</h1>

  <div class="container">
    <!-- <RandomCanvas/> -->
    <!-- <DemoLinearAlgebra/> -->

    <Calculation2D/>
    <Calculation3D/>

    <!-- <DemoBouncingBalls/> -->

    <CubeVisuals01/>
    <CubeVisuals02/>
    <!-- <CubeVisuals03/> -->
    <CubeVisuals04/>

    <MathVisuals01/>
    <MathVisuals02/>
    <MathVisuals03/>
    <!-- <MathVisuals04/> -->

    <Shapes2D/>
    <Shapes3D/>
  </div>
</template>

<style scoped>
/* .container { width: 500px; } */
</style>
