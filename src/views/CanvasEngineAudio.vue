<script setup>
import DemoExtraction from "./audio-engine/DemoExtraction.vue"
import AudioVizCatalog from "./audio-engine/AudioVizCatalog.vue"
// import WebGLBasedVisuals from "./audio-engine/WebGLBasedVisuals.vue"
// import AnotherProcessingDemo from "./audio-engine/AnoterProcessingDemo.vue"
import EqualizerDemo from "./audio-engine/EqualizerDemo.vue"
import MetadataExtractorDemo from "./audio-engine/MetadataExtractorDemo.vue"
</script>

<template>
  <div class="audio-related-container">

  <DemoExtraction/>
  <AudioVizCatalog/>

  <!-- <WebGLBasedVisuals/> -->
    <!-- <AnotherProcessingDemo/> -->

    <EqualizerDemo/>

    <MetadataExtractorDemo/>

  </div>
</template>

<style scoped>
.audio-related-container>div {
  margin: 40px; 
  border: 1px solid gray;
  border-radius: 10px;
}
</style>
