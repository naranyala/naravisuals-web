<script setup>

// import GridAndRulerDemo from "./canvas-engine/GridAndRulerDemo.vue"
// import DevToolsDemo from "./canvas-engine/DevtoolsDemo.vue"
// import CollisionDemo from "./canvas-engine/CollisionDemo.vue"

import ShapesDemo from "./canvas-engine/ShapesDemo.vue"
import ParticleDemo from "./canvas-engine/ParticleDemo.vue"
import PhysicsDemo from "./canvas-engine/PhysicsDemo.vue"
import TweenDemo from "./canvas-engine/TweenDemo.vue"
import TextDemo from "./canvas-engine/TextDemo.vue"
import ColorPaletteDemo from "./canvas-engine/ColorPaletteDemo.vue"
import MathDemo from "./canvas-engine/MathDemo.vue"
// import ThreeDimentionalDemo from "./canvas-engine/ThreeDimentionalDemo.vue"
import AudioVizDemo from "./canvas-engine/AudioVizDemo.vue"
import KeyboardEvents from "./canvas-engine/KeyboardEventsDemo.vue"

</script>

<template>
  <div class="engine-container">

    <!-- <GridAndRulerDemo /> -->
    <!-- <DevToolsDemo /> -->
    <!-- <CollisionDemo /> -->
    <!-- <ThreeDimentionalDemo /> -->

    <ShapesDemo />
    <ParticleDemo />
    <PhysicsDemo />
    <TweenDemo />
    <TextDemo />
    <ColorPaletteDemo />
    <MathDemo />
    <AudioVizDemo />
    <KeyboardEvents />

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
