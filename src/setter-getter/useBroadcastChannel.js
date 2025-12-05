// useBroadcastChannel.js
import { ref, onUnmounted } from 'vue'

export function useBroadcastChannel(channelName) {
  const channel = ref(null)
  const messages = ref([])
  const isConnected = ref(false)

  const getMessages = () => [...messages.value]
  const getLastMessage = () => messages.value[messages.value.length - 1]
  const isChannelOpen = () => isConnected.value

  const connect = (name = channelName) => {
    if (channel.value) {
      disconnect()
    }

    try {
      channel.value = new BroadcastChannel(name)
      isConnected.value = true

      channel.value.onmessage = (event) => {
        messages.value.push({
          data: event.data,
          timestamp: new Date(),
          type: 'received'
        })
      }

      channel.value.onmessageerror = (error) => {
        console.error('BroadcastChannel error:', error)
      }

      return true
    } catch (error) {
      console.error('Failed to create BroadcastChannel:', error)
      return false
    }
  }

  const send = (message) => {
    if (!channel.value || !isConnected.value) {
      console.warn('Channel not connected')
      return false
    }

    try {
      channel.value.postMessage(message)
      messages.value.push({
        data: message,
        timestamp: new Date(),
        type: 'sent'
      })
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  const disconnect = () => {
    if (channel.value) {
      channel.value.close()
      channel.value = null
      isConnected.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    getMessages,
    getLastMessage,
    isChannelOpen,
    connect,
    send,
    disconnect,
    clearMessages,
    messages,
    isConnected
  }
}
