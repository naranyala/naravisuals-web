// composables/useSyncedRef.js
import { ref, computed } from 'vue'

export function useSyncedRef(propRef, emit, eventName = 'update:modelValue') {
  const local = ref(propRef.value)

  // When prop changes externally (e.g. parent update), sync local
  // (Note: in full app, you'd use `watch(propRef, ...)` — omitted for simplicity)
  // For this composable, we assume propRef is static or manually handled

  const value = computed({
    get: () => propRef.value,
    set: (newVal) => {
      local.value = newVal
      emit(eventName, newVal)
    }
  })

  return { value }
}

// <!-- MyInput.vue -->
// <script setup>
// import { useSyncedRef } from '@/composables/useSyncedRef'
//
// const props = defineProps({ modelValue: String })
// const emit = defineEmits(['update:modelValue'])
//
// const { value: text } = useSyncedRef(toRef(props, 'modelValue'), emit)
// </script>
//
// <template>
//   <input v-model="text" />
// </template>
