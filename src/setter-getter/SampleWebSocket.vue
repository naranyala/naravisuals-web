<template>
  <div>
    <h3>WebSocket Manager</h3>

    <div class="status" :class="{ connected: ws.getIsConnected() }">
      Status: {{ ws.getIsConnected() ? 'Connected' : 'Disconnected' }}
      <span v-if="!ws.getIsConnected() && ws.getReconnectCount() > 0">
        (Reconnecting {{ ws.getReconnectCount() }}/5)
      </span>
    </div>

    <div v-if="ws.getError()" class="error">
      Error: {{ ws.getError() }}
    </div>

    <div class="controls">
      <input v-model="serverUrl" placeholder="wss://echo.websocket.org" />
      <button @click="connect" :disabled="ws.getIsConnected()">Connect</button>
      <button @click="disconnect" :disabled="!ws.getIsConnected()">Disconnect</button>
      <button @click="sendMessage" :disabled="!ws.getIsConnected()">Send</button>
      <button @click="ws.sendPing()" :disabled="!ws.getIsConnected()">Ping</button>
    </div>

    <div class="message-input">
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Message to send" />
    </div>

    <div class="messages">
      <h4>Messages ({{ ws.getMessages().length }}):</h4>
      <button @click="ws.clearMessages()">Clear Messages</button>
      <div v-for="(msg, idx) in ws.getMessages()" :key="idx" :class="msg.type">
        [{{ msg.timestamp.toLocaleTimeString() }}]
        {{ msg.type.toUpperCase() }}: {{ msg.data }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWebSocket } from './useWebSocket'

const serverUrl = ref('wss://echo.websocket.org')
const message = ref('')
const ws = useWebSocket(serverUrl.value, {
  autoConnect: false,
  reconnect: true,
  reconnectAttempts: 5
})

function connect() {
  ws.setUrl(serverUrl.value)
  ws.connect()
}

function disconnect() {
  ws.disconnect(1000, 'User disconnected')
}

function sendMessage() {
  if (message.value.trim()) {
    ws.send(message.value)
    message.value = ''
  }
}
</script>
