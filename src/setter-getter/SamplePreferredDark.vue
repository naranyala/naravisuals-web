<script setup>

import { usePreferredDark } from "./usePreferredDark.js"

const [isDark, { setDark }] = usePreferredDark()
</script>

<template>
  <button @click="setDark(!isDark)">
    Toggle Dark Mode
  </button>
</template>
