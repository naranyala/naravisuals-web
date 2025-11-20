
<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script setup>
const props = defineProps({
  msg: {
    type: String,
    default: 'Hello Vue 3!'
  }
})
</script>

<style scoped>
.hello {
  color: #42b983;
}
</style>
