<script setup>

import { useWindowSize } from "./useWindowSize.js"

const [{ width }] = useWindowSize()
</script>

<template>
  <p v-if="width < 768">Mobile view</p>
  <p v-else>Desktop view</p>
</template>
