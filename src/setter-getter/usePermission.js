// usePermission.js
import { ref, onMounted } from 'vue'

export function usePermission(permissionName) {
  const state = ref('prompt') // 'granted', 'denied', 'prompt'
  const isSupported = ref('permissions' in navigator)

  const get = () => state.value
  const getStatus = () => state.value
  const isGranted = () => state.value === 'granted'
  const isDenied = () => state.value === 'denied'

  const set = async (newPermissionName) => {
    if (!isSupported.value) {
      console.warn('Permissions API not supported')
      return false
    }

    try {
      const permission = await navigator.permissions.query({
        name: newPermissionName
      })

      state.value = permission.state

      permission.onchange = () => {
        state.value = permission.state
      }

      return true
    } catch (error) {
      console.error('Permission query failed:', error)
      return false
    }
  }

  const request = async () => {
    if (!isSupported.value) return false

    try {
      // Different permissions require different APIs
      switch (permissionName) {
        case 'geolocation':
          return await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false)
            )
          })

        case 'notifications':
          if ('Notification' in window) {
            const permission = await Notification.requestPermission()
            state.value = permission
            return permission === 'granted'
          }
          break

        case 'camera':
        case 'microphone':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              [permissionName]: true
            })
            stream.getTracks().forEach(track => track.stop())
            state.value = 'granted'
            return true
          } catch {
            state.value = 'denied'
            return false
          }
      }

      return false
    } catch (error) {
      console.error('Permission request failed:', error)
      return false
    }
  }

  onMounted(() => {
    if (isSupported.value && permissionName) {
      set(permissionName)
    }
  })

  return {
    get,
    getStatus,
    isGranted,
    isDenied,
    set,
    request,
    isSupported,
    state
  }
}
