<script setup>
import RandomCanvas from "./canvas-demo/RandomCanvas.vue"
import DemoLinearAlgebra from "./canvas-demo/DemoLinearAlgebra.vue"

import Calculation2D from "./gallery/Calculation2D.vue"
import Calculation3D from "./gallery/Calculation3D.vue"

</script>

<template>
  <h1>MY GALLERY</h1>

  <div class="container">
    <RandomCanvas/>
    <DemoLinearAlgebra/>

    <Calculation2D/>
    <Calculation3D/>

  </div>
</template>

<style scoped>
/* .container { width: 500px; } */
</style>
