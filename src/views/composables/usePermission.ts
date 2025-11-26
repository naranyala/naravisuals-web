// composables/usePermission.ts
import { ref, onMounted } from 'vue'

export function usePermission(name: PermissionName) {
  const state = ref<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt')

  const query = async () => {
    if (!('permissions' in navigator)) {
      state.value = 'unsupported'
      return
    }
    try {
      const status = await navigator.permissions.query({ name })
      state.value = status.state as any
      status.onchange = () => (state.value = status.state as any)
    } catch {
      state.value = 'unsupported'
    }
  }

  onMounted(query)
  return readonly(state)
}

// Usage
// const camera = usePermission('camera')
// const notifications = usePermission('notifications')
