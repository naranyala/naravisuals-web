<script setup>
import { useCookie } from './useCookie'

const { value: consent } = useCookie('cookie-consent', 'pending')
</script>

<template>
  <div v-if="consent === 'pending'">
    <p>We use cookies. Accept?</p>
    <button @click="consent = 'accepted'">Accept</button>
    <button @click="consent = 'rejected'">Reject</button>
  </div>
</template>
