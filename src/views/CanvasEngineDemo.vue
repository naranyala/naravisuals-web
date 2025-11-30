<script setup>

// import GridAndRulerDemo from "./canvas-engine/GridAndRulerDemo.vue"
// import DevToolsDemo from "./canvas-engine/DevtoolsDemo.vue"
// import CollisionDemo from "./canvas-engine/CollisionDemo.vue"
// import ThreeDimentionalDemo from "./canvas-engine/ThreeDimentionalDemo.vue"
// import MathDemo from "./canvas-engine/MathDemo.vue"

import ShapesDemo from "./canvas-engine/ShapesDemo.vue"
import ParticleDemo from "./canvas-engine/ParticleDemo.vue"
import TweenDemo from "./canvas-engine/TweenDemo.vue"
import TextDemo from "./canvas-engine/TextDemo.vue"
import ColorPaletteDemo from "./canvas-engine/ColorPaletteDemo.vue"
import AudioVizDemo from "./canvas-engine/AudioVizDemo.vue"
import KeyboardEvents from "./canvas-engine/KeyboardEventsDemo.vue"
import LinearAlgebraDemo from "./canvas-engine/LinearAlgebraDemo.vue"
import DragCanvasDemo from "./canvas-engine/DragCanvasDemo.vue"
import Shapes3DDemo from "./canvas-engine/Shapes3DDemo.vue"
import MorphDemo from "./canvas-engine/MorphDemo.vue"

// import PlanetOrbitDemo from "./canvas-engine/PlanetOrbitsDemo.vue"

import CubeWithShadow from "./canvas-engine/CubeWithShadow.vue"

</script>

<template>
  <div class="engine-container">

    <ShapesDemo />
    <ParticleDemo />
    <TweenDemo />

    <!-- <TextDemo /> -->
    <!-- <DragCanvasDemo /> -->
    <!-- <ColorPaletteDemo /> -->
    <!-- <LinearAlgebraDemo /> -->
    <!-- <Shapes3DDemo /> -->
    <!-- <MorphDemo /> -->
    <!-- <PlanetOrbitDemo /> -->

    <!-- <CubeWithShadow /> -->

    <!-- <AudioVizDemo /> -->
    <!-- <KeyboardEvents /> -->
    <!-- <MathDemo /> -->
    <!-- <GridAndRulerDemo /> -->
    <!-- <DevToolsDemo /> -->
    <!-- <CollisionDemo /> -->
    <!-- <ThreeDimentionalDemo /> -->
    <!-- END OF LIST-->
  </div>
</template>

<style scoped>
.engine-container div {
  margin: 20px;
  border: 1px solid gray;
  border-radius: 20px;
  padding: 20px;
}
</style>
