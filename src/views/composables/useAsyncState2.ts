// composables/useAsyncState.ts
import { ref, shallowRef } from 'vue'

export function useAsyncState<T>(
  promiseFn: () => Promise<T>,
  initialState: T,
  options?: { delay?: number; immediate?: boolean }
) {
  const state = shallowRef(initialState)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (delay = options?.delay ?? 0) => {
    loading.value = true
    error.value = null

    if (delay > 0) await new Promise(r => setTimeout(r, delay))

    try {
      state.value = await promiseFn()
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  if (options?.immediate !== false) execute()

  return {
    state: readonly(state),
    loading: readonly(loading),
    error: readonly(error),
    execute,
  }
}
