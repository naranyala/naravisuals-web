// composables/useToggleGroup.js
import { ref, computed } from 'vue'

export function useToggleGroup(items = [], single = true) {
  const activeKeys = ref(new Set(items))

  const getIsOpen = (key) => activeKeys.value.has(key)

  const setOpen = (key, isOpen) => {
    if (single && isOpen) {
      // Close all others
      activeKeys.value = new Set([key])
    } else if (isOpen) {
      activeKeys.value.add(key)
    } else {
      activeKeys.value.delete(key)
    }
  }

  // Return a factory function that creates per-key getter/setter
  const createToggle = (key) => {
    return computed({
      get: () => getIsOpen(key),
      set: (isOpen) => setOpen(key, isOpen)
    })
  }

  return { createToggle }
}

// <script setup>
// import { useToggleGroup } from '@/composables/useToggleGroup'
//
// const { createToggle } = useToggleGroup(['panel1', 'panel2', 'panel3'], true)
//
// const panel1 = createToggle('panel1')
// const panel2 = createToggle('panel2')
// // Each is a writable computed: true/false
// </script>
//
// <template>
//   <div>
//     <button @click="panel1 = !panel1">Toggle Panel 1</button>
//     <div v-show="panel1">Content 1</div>
//
//     <button @click="panel2 = !panel2">Toggle Panel 2</button>
//     <div v-show="panel2">Content 2</div>
//   </div>
// </template>
