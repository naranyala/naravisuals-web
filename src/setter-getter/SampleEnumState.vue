<script setup>
import { useEnumState } from './useEnumState'

const { value: status, is } = useEnumState('idle', ['idle', 'loading', 'success', 'error'])

const submit = () => {
  status.value = 'loading'
  api.post().then(() => {
    status.value = 'success'
  }).catch(() => {
    status.value = 'error'
  })
}
</script>

<template>
  <div>
    <button @click="submit" :disabled="is('loading')">
      Submit
    </button>
    <p v-if="is('loading')">Saving...</p>
    <p v-else-if="is('success')" style="color: green">Saved!</p>
    <p v-else-if="is('error')" style="color: red">Failed!</p>
  </div>
</template>
