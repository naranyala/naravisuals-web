// composables/usePrevious.js
import { ref, watchEffect, shallowRef } from 'vue'

export function usePrevious(source) {
  const previous = shallowRef(undefined)
  const current = shallowRef(source.value)

  watchEffect(() => {
    previous.value = current.value
    current.value = source.value
  })

  // Read-only "getter"
  return {
    value: previous // always lags one update behind `source`
  }
}

// <script setup>
// import { ref } from 'vue'
// import { usePrevious } from '@/composables/usePrevious'
//
// const count = ref(0)
// const prevCount = usePrevious(count)
//
// const increment = () => count.value++
// </script>
//
// <template>
//   <div>
//     <p>Current: {{ count }}</p>
//     <p>Previous: {{ prevCount.value }}</p>
//     <button @click="increment">+1</button>
//   </div>
// </template>
