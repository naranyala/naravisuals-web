<script setup>
// import RandomCanvas from "../exploration_apps/gallery/RandomCanvas.vue"
// import DemoLinearAlgebra from "../exploration_apps/gallery/DemoLinearAlgebra.vue"
// import DemoBouncingBalls from "../exploration_apps/gallery/DemoBouncingBalls.vue"

import Calculation2D from "../exploration_apps/gallery/Calculation2D.vue"
import Calculation3D from "../exploration_apps/gallery/Calculation3D.vue"

import MathVisuals01 from "../exploration_apps/gallery/MathVisuals01.vue"
import MathVisuals02 from "../exploration_apps/gallery/MathVisuals02.vue"
import MathVisuals03 from "../exploration_apps/gallery/MathVisuals03.vue"
import MathVisuals04 from "../exploration_apps/gallery/MathVisuals04.vue"

import CubeVisuals01 from "../exploration_apps/gallery/CubeVisuals01.vue"
import CubeVisuals02 from "../exploration_apps/gallery/CubeVisuals02.vue"
import CubeVisuals03 from "../exploration_apps/gallery/CubeVisuals03.vue"
import CubeVisuals04 from "../exploration_apps/gallery/CubeVisuals04.vue"

import Shapes2D from "../exploration_apps/gallery/Shapes2D.vue"
import Shapes3D from "../exploration_apps/gallery/Shapes3D.vue"

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
