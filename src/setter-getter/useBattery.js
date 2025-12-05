// composables/useBattery.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useBattery() {
  const charging = ref(false)
  const level = ref(1)
  const chargingTime = ref(0)
  const dischargingTime = ref(0)

  let battery

  const update = () => {
    if (!battery) return
    charging.value = battery.charging
    level.value = battery.level
    chargingTime.value = battery.chargingTime
    dischargingTime.value = battery.dischargingTime
  }

  onMounted(async () => {
    if (!('getBattery' in navigator)) return
    battery = await navigator.getBattery()
    battery.addEventListener('chargingchange', update)
    battery.addEventListener('levelchange', update)
    update()
  })

  onUnmounted(() => {
    battery?.removeEventListener('chargingchange', update)
    battery?.removeEventListener('levelchange', update)
  })

  return [{ charging, level, chargingTime, dischargingTime }]
}
