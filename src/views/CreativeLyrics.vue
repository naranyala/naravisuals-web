<script setup>
import DynamicTextStyling from "./creative-lyrics/DynamicTextStyling.vue"
import GradientPanel from "./creative-lyrics/GradientPanel.vue"
import SimpleAudioPlayer from "./creative-lyrics/SimpleAudioPlayer.vue"
import MySrtEditor from "./creative-lyrics/MySrtEditor.vue"

</script>

<template>
  <div class="container">
  <SimpleAudioPlayer/>
  <MySrtEditor/>
  <DynamicTextStyling/>
  <GradientPanel/>
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
</style>
