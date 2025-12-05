<script setup>
import { useBoolMap } from './useBoolMap'

const flags = useBoolMap({
  loading: false,
  darkMode: true
})
</script>

<template>
  <p>Loading: {{ flags.get('loading') }}</p>
  <button @click="flags.toggle('loading')">Toggle Loading</button>
</template>
