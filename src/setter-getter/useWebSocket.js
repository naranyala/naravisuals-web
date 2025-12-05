// useWebSocket.js
import { ref, onUnmounted } from 'vue'

export function useWebSocket(url, options = {}) {
  const {
    autoConnect = true,
    reconnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000
  } = options

  const socket = ref(null)
  const isConnected = ref(false)
  const messages = ref([])
  const error = ref(null)
  const reconnectCount = ref(0)

  const get = () => socket.value
  const getMessages = () => [...messages.value]
  const getLastMessage = () => messages.value[messages.value.length - 1]
  const getError = () => error.value
  const getIsConnected = () => isConnected.value
  const getReconnectCount = () => reconnectCount.value

  const connect = (newUrl = url) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected')
      return
    }

    try {
      socket.value = new WebSocket(newUrl)
      error.value = null

      socket.value.onopen = () => {
        isConnected.value = true
        reconnectCount.value = 0
        messages.value.push({
          type: 'system',
          data: 'Connected',
          timestamp: new Date()
        })
      }

      socket.value.onmessage = (event) => {
        messages.value.push({
          type: 'received',
          data: event.data,
          timestamp: new Date()
        })
      }

      socket.value.onerror = (event) => {
        error.value = 'WebSocket error'
        console.error('WebSocket error:', event)
      }

      socket.value.onclose = (event) => {
        isConnected.value = false
        messages.value.push({
          type: 'system',
          data: `Disconnected: ${event.code} ${event.reason}`,
          timestamp: new Date()
        })

        if (reconnect && reconnectCount.value < reconnectAttempts) {
          setTimeout(() => {
            reconnectCount.value++
            connect(newUrl)
          }, reconnectDelay * reconnectCount.value)
        }
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to create WebSocket:', err)
    }
  }

  const send = (data) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(typeof data === 'string' ? data : JSON.stringify(data))
      messages.value.push({
        type: 'sent',
        data,
        timestamp: new Date()
      })
      return true
    }
    return false
  }

  const disconnect = (code = 1000, reason = 'Normal closure') => {
    if (socket.value) {
      socket.value.close(code, reason)
      socket.value = null
    }
  }

  const clearMessages = () => {
    messages.value = []
  }

  const clearError = () => {
    error.value = null
  }

  const sendPing = () => {
    return send('ping')
  }

  const setUrl = (newUrl) => {
    url = newUrl
    if (isConnected.value) {
      disconnect()
      connect(newUrl)
    }
  }

  // Auto-connect on creation
  if (autoConnect) {
    connect()
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    get,
    getMessages,
    getLastMessage,
    getError,
    getIsConnected,
    getReconnectCount,
    connect,
    send,
    disconnect,
    clearMessages,
    clearError,
    sendPing,
    setUrl,
    socket,
    isConnected,
    messages,
    error
  }
}
