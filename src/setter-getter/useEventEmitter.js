// useEventEmitter.js
import { onUnmounted } from 'vue'

export function useEventEmitter() {
  const events = new Map()

  const getListeners = (eventName) => {
    return events.get(eventName) || []
  }

  const getEventNames = () => Array.from(events.keys())

  const on = (eventName, handler) => {
    if (!events.has(eventName)) {
      events.set(eventName, [])
    }
    events.get(eventName).push(handler)

    // Return unsubscribe function
    return () => off(eventName, handler)
  }

  const once = (eventName, handler) => {
    const onceHandler = (...args) => {
      handler(...args)
      off(eventName, onceHandler)
    }
    return on(eventName, onceHandler)
  }

  const off = (eventName, handler) => {
    const handlers = events.get(eventName)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
      if (handlers.length === 0) {
        events.delete(eventName)
      }
    }
  }

  const emit = (eventName, ...args) => {
    const handlers = events.get(eventName)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for "${eventName}":`, error)
        }
      })
    }
  }

  const clear = (eventName) => {
    if (eventName) {
      events.delete(eventName)
    } else {
      events.clear()
    }
  }

  const createScopedEmitter = (prefix) => {
    return {
      on: (event, handler) => on(`${prefix}:${event}`, handler),
      once: (event, handler) => once(`${prefix}:${event}`, handler),
      off: (event, handler) => off(`${prefix}:${event}`, handler),
      emit: (event, ...args) => emit(`${prefix}:${event}`, ...args)
    }
  }

  onUnmounted(() => {
    clear()
  })

  return {
    getListeners,
    getEventNames,
    on,
    once,
    off,
    emit,
    clear,
    createScopedEmitter
  }
}
