// composables/useAsyncQueue.ts
import { ref, readonly } from 'vue'

export function useAsyncQueue(tasks: (() => Promise<any>)[]) {
  const results = ref<any[]>([])
  const pending = ref(tasks.length)
  const isRunning = ref(false)

  const run = async () => {
    isRunning.value = true
    for (const task of tasks) {
      results.value.push(await task())
      pending.value--
    }
    isRunning.value = false
  }

  return { 
    run, 
    results: readonly(results), 
    pending: readonly(pending), 
    isRunning: readonly(isRunning) 
  }
}
