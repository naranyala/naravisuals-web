// useGeoLocation.js
import { ref, onUnmounted } from 'vue'

export function useGeoLocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false
  } = options

  const position = ref(null)
  const error = ref(null)
  const isLoading = ref(false)
  const watchId = ref(null)

  const get = () => position.value
  const getError = () => error.value
  const getIsLoading = () => isLoading.value
  const getCoords = () => position.value?.coords
  const getAccuracy = () => position.value?.coords?.accuracy
  const getTimestamp = () => position.value?.timestamp

  const getAddress = async () => {
    if (!position.value) return null

    try {
      const { latitude, longitude } = position.value.coords
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
      return await response.json()
    } catch (err) {
      console.error('Reverse geocoding failed:', err)
      return null
    }
  }

  const getDistance = (targetCoords) => {
    if (!position.value || !targetCoords) return null

    const { latitude: lat1, longitude: lon1 } = position.value.coords
    const { latitude: lat2, longitude: lon2 } = targetCoords

    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in km
  }

  const locate = () => {
    if (!navigator.geolocation) {
      error.value = 'Geolocation not supported'
      return Promise.reject(error.value)
    }

    isLoading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          position.value = pos
          isLoading.value = false
          resolve(pos)
        },
        (err) => {
          error.value = err.message
          isLoading.value = false
          reject(err)
        },
        { enableHighAccuracy, timeout, maximumAge }
      )
    })
  }

  const startWatching = (watchOptions = options) => {
    if (!navigator.geolocation) {
      error.value = 'Geolocation not supported'
      return false
    }

    if (watchId.value !== null) {
      stopWatching()
    }

    watchId.value = navigator.geolocation.watchPosition(
      (pos) => {
        position.value = pos
      },
      (err) => {
        error.value = err.message
      },
      watchOptions
    )

    return true
  }

  const stopWatching = () => {
    if (watchId.value !== null) {
      navigator.geolocation.clearWatch(watchId.value)
      watchId.value = null
    }
  }

  const clear = () => {
    position.value = null
    error.value = null
  }

  // Auto-start watching if option is set
  if (watch) {
    startWatching()
  }

  onUnmounted(() => {
    stopWatching()
  })

  return {
    get,
    getError,
    getIsLoading,
    getCoords,
    getAccuracy,
    getTimestamp,
    getAddress,
    getDistance,
    locate,
    startWatching,
    stopWatching,
    clear,
    position,
    error,
    isLoading
  }
}
