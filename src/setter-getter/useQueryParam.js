// composables/useQueryParam.js
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useQueryParam(paramName, defaultValue = '') {
  const router = useRouter()
  const route = useRoute()

  const value = computed({
    get() {
      return route.query[paramName] ?? defaultValue
    },
    set(newValue) {
      const query = { ...route.query, [paramName]: newValue === defaultValue ? undefined : newValue }
      router.push({ query })
    }
  })

  return { value }
}

// <script setup>
// import { useQueryParam } from '@/composables/useQueryParam'
//
// const { value: category } = useQueryParam('category', 'all')
// </script>
//
// <template>
//   <div>
//     <select v-model="category">
//       <option value="all">All</option>
//       <option value="tech">Tech</option>
//       <option value="news">News</option>
//     </select>
//     <!-- URL becomes /?category=tech -->
//   </div>
// </template>
