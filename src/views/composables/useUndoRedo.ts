import {ref} from "vue"

export function useUndoRedo(initial) {
  const current = ref(initial)
  const history = ref([initial])
  const index = ref(0)

  function set(v) {
    history.value = history.value.slice(0, index.value + 1)
    history.value.push(v)
    index.value++
    current.value = v
  }

  function undo() {
    if (index.value > 0) index.value--
    current.value = history.value[index.value]
  }

  function redo() {
    if (index.value < history.value.length - 1) index.value++
    current.value = history.value[index.value]
  }

  return { current, set, undo, redo }
}

