// useWorker.js
import { ref, onUnmounted } from 'vue'

export function useWorker(workerScript) {
  const worker = ref(null)
  const isRunning = ref(false)
  const results = ref([])
  const error = ref(null)

  const getResults = () => [...results.value]
  const getLastResult = () => results.value[results.value.length - 1]
  const getError = () => error.value
  const isWorkerActive = () => isRunning.value

  const create = (script = workerScript) => {
    if (worker.value) {
      terminate()
    }

    try {
      if (typeof script === 'string') {
        worker.value = new Worker(script)
      } else if (script instanceof Blob) {
        const blobURL = URL.createObjectURL(script)
        worker.value = new Worker(blobURL)
      } else {
        throw new Error('Invalid worker script')
      }

      worker.value.onmessage = (event) => {
        results.value.push({
          data: event.data,
          timestamp: new Date()
        })
      }

      worker.value.onerror = (err) => {
        error.value = err.message
        console.error('Worker error:', err)
      }

      worker.value.onmessageerror = (err) => {
        error.value = 'Message error: ' + err
        console.error('Worker message error:', err)
      }

      isRunning.value = true
      error.value = null
      return true
    } catch (err) {
      error.value = err.message
      console.error('Failed to create worker:', err)
      return false
    }
  }

  const post = (message, transfer = []) => {
    if (!worker.value || !isRunning.value) {
      console.warn('Worker not running')
      return false
    }

    try {
      worker.value.postMessage(message, transfer)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Failed to post message:', err)
      return false
    }
  }

  const terminate = () => {
    if (worker.value) {
      worker.value.terminate()
      worker.value = null
      isRunning.value = false
    }
  }

  const clearResults = () => {
    results.value = []
  }

  const clearError = () => {
    error.value = null
  }

  onUnmounted(() => {
    terminate()
  })

  return {
    getResults,
    getLastResult,
    getError,
    isWorkerActive,
    create,
    post,
    terminate,
    clearResults,
    clearError,
    results,
    error,
    isRunning
  }
}
