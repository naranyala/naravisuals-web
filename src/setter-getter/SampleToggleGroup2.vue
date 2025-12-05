<script setup>
import { useToggleGroup } from './useToggleGroup'

const size = useToggleGroup(['sm', 'md', 'lg'], 'md')
</script>

<template>
  <label v-for="s in ['sm', 'md', 'lg']" :key="s">
    <input type="radio" :checked="size.is(s)" @change="size.set(s)">
    {{ s }}
  </label>
  <p>Active: {{Object.keys(size.get()).find(k => size.get()[k])}}</p>
</template>
