<template>
  <div class="card">
    <h3>Selected Location</h3>
    <div v-if="picked" ref="staticMapRef" class="map"></div>
    <p v-if="picked">Lat: {{ coords.lat.toFixed(5) }}, Lng: {{ coords.lng.toFixed(5) }}</p>
    <button @click="openModal" class="btn">{{ picked ? 'Change Location' : 'Pick Location' }}</button>
  </div>
  
  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h3>Pick a Location</h3>
      <p class="hint">Click on the map to select a location</p>
      <div ref="pickerMapRef" class="map"></div>
      <div class="modal-actions">
        <button @click="closeModal" class="btn btn-cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import L from "leaflet";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const showModal = ref(false);
const picked = ref(false);
const coords = ref({ lat: -7.8, lng: 112.0 }); // East Java default

const pickerMapRef = ref(null);
const staticMapRef = ref(null);

let pickerMap = null;
let staticMap = null;
let pickerMarker = null;

function addTileLayer(targetMap) {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(targetMap);
}

function openModal() {
  showModal.value = true;
  nextTick(() => {
    setTimeout(initPicker, 150);
  });
}

function closeModal() {
  showModal.value = false;
  if (pickerMap) {
    pickerMap.off();
    pickerMap.remove();
    pickerMap = null;
    pickerMarker = null;
  }
}

function initPicker() {
  if (!pickerMapRef.value || pickerMap) return;

  try {
    pickerMap = L.map(pickerMapRef.value, {
      center: [coords.value.lat, coords.value.lng],
      zoom: 8
    });
    
    addTileLayer(pickerMap);

    // Add existing marker if location was previously picked
    if (picked.value) {
      pickerMarker = L.marker([coords.value.lat, coords.value.lng]).addTo(pickerMap);
    }

    pickerMap.on("click", (e) => {
      coords.value = { lat: e.latlng.lat, lng: e.latlng.lng };
      
      // Remove old marker
      if (pickerMarker) {
        pickerMap.removeLayer(pickerMarker);
      }
      
      // Add new marker
      pickerMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(pickerMap);
      
      picked.value = true;
      
      // Close modal and update static map
      setTimeout(() => {
        closeModal();
        nextTick(() => {
          setTimeout(initStatic, 150);
        });
      }, 300);
    });

    // Force map to recalculate size
    setTimeout(() => {
      if (pickerMap) pickerMap.invalidateSize();
    }, 200);
  } catch (error) {
    console.error("Error initializing picker map:", error);
  }
}

function initStatic() {
  if (!staticMapRef.value) return;

  if (staticMap) {
    staticMap.off();
    staticMap.remove();
    staticMap = null;
  }

  try {
    staticMap = L.map(staticMapRef.value, {
      center: [coords.value.lat, coords.value.lng],
      zoom: 13,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      touchZoom: false,
    });
    
    addTileLayer(staticMap);
    L.marker([coords.value.lat, coords.value.lng]).addTo(staticMap);

    // Ensure proper rendering
    setTimeout(() => {
      if (staticMap) staticMap.invalidateSize();
    }, 200);
  } catch (error) {
    console.error("Error initializing static map:", error);
  }
}

// Cleanup on component unmount
onBeforeUnmount(() => {
  if (pickerMap) {
    pickerMap.off();
    pickerMap.remove();
  }
  if (staticMap) {
    staticMap.off();
    staticMap.remove();
  }
});
</script>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';

.card {
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  background: #fafafa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.card p {
  margin: 0.5rem 0 1rem;
  font-family: monospace;
  color: #666;
}

.map {
  height: 300px;
  width: 100%;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  background: #e5e5e5;
}

.btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn:hover {
  background: #0056b3;
}

.btn-cancel {
  background: #6c757d;
}

.btn-cancel:hover {
  background: #545b62;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
}

.hint {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}
</style>
