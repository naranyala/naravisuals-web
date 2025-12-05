<template>
  <div>
    <h3>Geolocation Manager</h3>

    <div class="status" :class="{ loading: geo.getIsLoading() }">
      Status: {{ geo.getIsLoading() ? 'Loading...' :
        geo.get() ? 'Located' : 'Not located' }}
    </div>

    <div v-if="geo.getError()" class="error">
      Error: {{ geo.getError() }}
    </div>

    <div v-if="geo.get()" class="coordinates">
      <p>Latitude: {{ geo.getCoords()?.latitude }}</p>
      <p>Longitude: {{ geo.getCoords()?.longitude }}</p>
      <p>Accuracy: {{ geo.getAccuracy() }} meters</p>
      <p>Updated: {{ new Date(geo.getTimestamp()).toLocaleTimeString() }}</p>

      <div v-if="address">
        <h4>Address:</h4>
        <p>{{ address.display_name }}</p>
      </div>

      <div v-if="targetLocation">
        <h4>Distance to target:</h4>
        <p>{{ distance }} km</p>
      </div>
    </div>

    <div class="controls">
      <button @click="getLocation" :disabled="geo.getIsLoading()">
        Get Location
      </button>
      <button @click="toggleWatch">
        {{ isWatching ? 'Stop Watching' : 'Start Watching' }}
      </button>
      <button @click="getAddress">Get Address</button>
      <button @click="calculateDistance">Calculate Distance</button>
      <button @click="geo.clear()">Clear</button>
    </div>

    <div class="target">
      <h4>Target Location:</h4>
      <input v-model.number="targetLat" placeholder="Latitude" type="number" />
      <input v-model.number="targetLng" placeholder="Longitude" type="number" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGeoLocation } from './useGeoLocation'

const geo = useGeoLocation({ watch: false })
const address = ref(null)
const targetLat = ref(40.7128)
const targetLng = ref(-74.0060)
const isWatching = ref(false)

const targetLocation = computed(() => ({
  latitude: targetLat.value,
  longitude: targetLng.value
}))

const distance = computed(() => {
  if (geo.get() && targetLocation.value) {
    return geo.getDistance(targetLocation.value)?.toFixed(2)
  }
  return null
})

async function getLocation() {
  try {
    await geo.locate()
  } catch (err) {
    console.error('Failed to get location:', err)
  }
}

function toggleWatch() {
  if (isWatching.value) {
    geo.stopWatching()
  } else {
    geo.startWatching({ enableHighAccuracy: true })
  }
  isWatching.value = !isWatching.value
}

async function getAddress() {
  if (geo.get()) {
    address.value = await geo.getAddress()
  }
}

function calculateDistance() {
  if (geo.get()) {
    console.log(`Distance: ${distance.value} km`)
  }
}
</script>
