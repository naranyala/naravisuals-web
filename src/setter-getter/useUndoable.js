// composables/useUndoable.js
import { ref, computed } from 'vue'

export function useUndoable(initialValue, maxHistory = 50) {
  const history = ref([initialValue])
  const pointer = ref(0) // index of current state

  const value = computed({
    get: () => history.value[pointer.value],
    set: (newVal) => {
      // Truncate future history if user changes after undo
      history.value = history.value.slice(0, pointer.value + 1)
      history.value.push(newVal)
      if (history.value.length > maxHistory) {
        history.value.shift()
      } else {
        pointer.value = history.value.length - 1
      }
    }
  })

  const canUndo = computed(() => pointer.value > 0)
  const canRedo = computed(() => pointer.value < history.value.length - 1)

  const undo = () => {
    if (canUndo.value) pointer.value--
  }

  const redo = () => {
    if (canRedo.value) pointer.value++
  }

  const reset = (newVal) => {
    history.value = [newVal]
    pointer.value = 0
  }

  return {
    value,
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  }
}

//
// <script setup>
// import { useUndoable } from '@/composables/useUndoable'
//
// const { value: content, undo, redo, canUndo, canRedo } = useUndoable('')
// </script>
//
// <template>
//   <div>
//     <textarea v-model="content"></textarea>
//     <br />
//     <button @click="undo" :disabled="!canUndo">↩️ Undo</button>
//     <button @click="redo" :disabled="!canRedo">↪️ Redo</button>
//   </div>
// </template>
//
