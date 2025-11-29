<script setup>
import ModalColorPalette from "./my-component-exploration/ModalColorPalette.vue"
import BetterColorPicker from "./my-component-exploration/BetterColorPicker.vue"

import { ref } from 'vue'

const showPickerModal = ref(false)
const currentColorModal = ref('#3498db')

const updateColor = (newColor) => {
  currentColor.value = newColor
}


const showPicker = ref(false)
const brandColor = ref('#3b82f6')

const onColorSelect = (color) => {
  brandColor.value = color
  // Apply to your app theme, etc.
}

</script>

<template>
  <!-- <ModalColorPalette /> -->
  <div>
    <button @click="showPickerModal = true">Open Color Picker</button>

    <ColorPickerModal v-model="showPickerModal" :initial-color="currentColorModal" @color-selected="updateColor" />

    <div :style="{ backgroundColor: currentColor, width: '100px', height: '100px' }"></div>
  </div>

  <hr />
  <!-- <BetterColorPicker /> -->
  <div>
    <button @click="showPicker = true">Change Brand Color</button>
    <RichColorPicker v-model="showPicker" :initial-color="brandColor" @color-selected="onColorSelect" />

  </div>
</template>
