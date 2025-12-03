// composables/useCookie.js
import { ref, computed } from 'vue'

function getCookie(name) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1] || null
}

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function useCookie(name, initialValue = '', options = {}) {
  const { days = 7 } = options

  const stored = getCookie(name)
  const initial = stored !== null ? decodeURIComponent(stored) : initialValue
  const internal = ref(initial)

  const value = computed({
    get: () => internal.value,
    set: (newVal) => {
      internal.value = newVal
      setCookie(name, newVal, days)
    }
  })

  const remove = () => {
    deleteCookie(name)
    internal.value = ''
  }

  return { value, remove }
}

// <script setup>
// import { useCookie } from '@/composables/useCookie'
//
// const { value: consent } = useCookie('cookie-consent', 'pending')
// </script>
//
// <template>
//   <div v-if="consent === 'pending'">
//     <p>We use cookies. Accept?</p>
//     <button @click="consent = 'accepted'">Accept</button>
//     <button @click="consent = 'rejected'">Reject</button>
//   </div>
// </template>
