<script setup>
const [{ copied }, { copy }] = useClipboard()

const copyEmail = () => copy('hello@domain.com')
</script>

<template>
  <button @click="copyEmail">
    {{ copied ? 'Copied!' : 'Copy Email' }}
  </button>
</template>
