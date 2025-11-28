<script setup>
import DynamicTextStyling from "../exploration_apps/clyrics/DynamicTextStyling.vue"
import GradientPanel from "../exploration_apps/clyrics/GradientPanel.vue"
import SimpleAudioPlayer from "../exploration_apps/clyrics/SimpleAudioPlayer.vue"
import MySrtEditor from "../exploration_apps/clyrics/MySrtEditor.vue"

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
