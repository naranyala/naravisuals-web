<template>
  <div>
    <h3>Cross-tab Communication</h3>
    <button @click="connectChannel" :disabled="channel.isConnected">
      {{ channel.isConnected ? 'Connected' : 'Connect' }}
    </button>
    <button @click="disconnectChannel" :disabled="!channel.isConnected">
      Disconnect
    </button>

    <div>
      <input v-model="message" @keyup.enter="sendMessage" />
      <button @click="sendMessage" :disabled="!channel.isConnected">Send</button>
    </div>

    <div class="messages">
      <div v-for="(msg, index) in channel.getMessages()" :key="index" :class="msg.type">
        [{{ msg.timestamp.toLocaleTimeString() }}] {{ msg.type }}: {{ msg.data }}
      </div>
    </div>

    <button @click="channel.clearMessages()">Clear Messages</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBroadcastChannel } from './useBroadcastChannel'

const channel = useBroadcastChannel('app-channel')
const message = ref('')

function connectChannel() {
  const connected = channel.connect()
  if (connected) {
    console.log('Connected to broadcast channel')
  }
}

function disconnectChannel() {
  channel.disconnect()
}

function sendMessage() {
  if (message.value.trim()) {
    channel.send(message.value)
    message.value = ''
  }
}
</script>

<style scoped>
.messages {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
}

.sent {
  color: green;
  text-align: right;
}

.received {
  color: blue;
  text-align: left;
}
</style>
