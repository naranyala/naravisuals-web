// useUndoRedo.js
import { ref, computed } from 'vue'

export function useUndoRedo(initialState) {
  const history = ref([initialState])
  const currentIndex = ref(0)

  const currentState = computed(() => history.value[currentIndex.value])

  const get = () => currentState.value
  const getHistory = () => [...history.value]
  const getCurrentIndex = () => currentIndex.value

  const set = (newState) => {
    // Remove future states if we're not at the end
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    history.value.push(newState)
    currentIndex.value = history.value.length - 1
  }

  const undo = () => {
    if (canUndo()) {
      currentIndex.value--
    }
  }

  const redo = () => {
    if (canRedo()) {
      currentIndex.value++
    }
  }

  const canUndo = () => currentIndex.value > 0
  const canRedo = () => currentIndex.value < history.value.length - 1

  const clearHistory = () => {
    history.value = [currentState.value]
    currentIndex.value = 0
  }

  const jumpTo = (index) => {
    if (index >= 0 && index < history.value.length) {
      currentIndex.value = index
    }
  }

  return {
    get,
    getHistory,
    getCurrentIndex,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    jumpTo,
    state: currentState
  }
}
