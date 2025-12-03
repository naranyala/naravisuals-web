// composables/useRangedValue.js
import { ref, computed } from 'vue'

export function useRangedValue(initial, min = 0, max = 100) {
  const internal = ref(Math.min(max, Math.max(min, initial)))

  const value = computed({
    get: () => internal.value,
    set: (newVal) => {
      if (typeof newVal !== 'number') return
      internal.value = Math.min(max, Math.max(min, newVal))
    }
  })

  return { value, min: min, max: max }
}

// <script setup>
// import { useRangedValue } from '@/composables/useRangedValue'
//
// const { value: volume } = useRangedValue(50, 0, 100)
// </script>
//
// <template>
//   <div>
//     <input type="range" v-model.number="volume" :min="0" :max="100" />
//     <p>Volume: {{ volume }}%</p>
//     <!-- Even if you set volume = 200, it becomes 100 -->
//   </div>
// </template>
