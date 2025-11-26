// composables/useInfiniteScroll.ts
import { ref, onMounted } from 'vue'

export function useInfiniteScroll(
  callback: () => Promise<any>,
  options: { distance?: number; disabled?: Ref<boolean> } = {}
) {
  const { distance = 100, disabled = ref(false) } = options
  const loading = ref(false)

  const loadMore = async () => {
    if (loading.value || disabled.value) return
    loading.value = true
    await callback()
    loading.value = false
  }

  onMounted(() => {
    const handler = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - distance) {
        loadMore()
      }
    }
    window.addEventListener('scroll', handler)
    onUnmounted(() => window.removeEventListener('scroll', handler))
  })

  return { loading: readonly(loading), loadMore }
}
