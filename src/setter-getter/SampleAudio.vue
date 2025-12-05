<script setup>
import { useAudio } from './useAudio'
const bgm = useAudio('/music.mp3')
</script>

<template>
  <button @click="bgm.play()">Play</button>
  <button @click="bgm.pause()">Pause</button>
</template>
