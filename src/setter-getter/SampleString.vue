<script setup>
import { useString } from './useString'

const msg = useString('hello')
</script>

<template>
  <p>{{ msg.get() }}</p>
  <button @click="msg.append(' world')">Append</button>
  <button @click="msg.clear()">Clear</button>
</template>
