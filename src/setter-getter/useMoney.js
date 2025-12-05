// ~/composables/useMoney.js
import { ref, computed } from 'vue'

export function useMoney(initialCents = 0, { locale = 'en-US', currency = 'USD' } = {}) {
  const raw = ref(initialCents) // always integer cents

  const value = computed({
    get() {
      return (raw.value / 100).toLocaleString(locale, {
        style: 'currency',
        currency
      })
    },
    set(v) {
      const n = Number(String(v).replace(/[^\d.-]/g, ''))
      raw.value = Math.round((n || 0) * 100)
    }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
