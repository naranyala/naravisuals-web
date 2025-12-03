// composables/useDerivedState.js
import { ref, computed } from 'vue'

export function useDerivedState(initialRaw, { parse, format }) {
  const raw = ref(initialRaw)

  const value = computed({
    get: () => format(raw.value),
    set: (formattedValue) => {
      raw.value = parse(formattedValue)
    }
  })

  return {
    value,          // formatted getter, parse-on-set setter
    rawValue: raw   // direct access to unformatted value
  }
}


// <script setup>
// import { useDerivedState } from '@/composables/useDerivedState'
//
//
// // helpers
// const formatPhone = (str) => {
//   const digits = str.replace(/\D/g, '').slice(0, 10)
//   if (digits.length <= 3) return digits
//   if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
//   return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`
// }
//
// const parsePhone = (formatted) => formatted.replace(/\D/g, '')
//
// const { value: phoneNumber } = useDerivedState('', {
//   format: formatPhone,
//   parse: parsePhone
// })
// </script>
//
// <template>
//   <input v-model="phoneNumber" placeholder="(123) 456-7890" />
//   <!-- User types "1234567890" → displays as "(123) 456-7890"
//        User edits display → raw updates correctly -->
// </template>
