<template>
  <div class="card">
    <h3>Selected Location</h3>
    <div v-if="picked" ref="staticMapRef" class="map"></div>
    <p v-if="picked">Lat: {{ coords.lat.toFixed(5) }}, Lng: {{ coords.lng.toFixed(5) }}</p>
    <button @click="openModal" class="btn">{{ picked ? 'Change Location' : 'Pick Location' }}</button>
  </div>
  
  <!-- Full Screen Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>Pick a Location</h3>
        <button @click="closeModal" class="btn-close">✕</button>
      </div>
      
      <div class="map-container">
        <div ref="pickerMapRef" class="map-fullscreen"></div>
        
        <!-- Crosshair -->
        <div class="crosshair">
          <div class="crosshair-horizontal"></div>
          <div class="crosshair-vertical"></div>
          <div class="crosshair-center"></div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="coords-display">
          <span v-if="tempCoords">
            Lat: {{ tempCoords.lat.toFixed(5) }}, Lng: {{ tempCoords.lng.toFixed(5) }}
          </span>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-cancel">Cancel</button>
          <button @click="saveLocation" class="btn btn-save">Save Location</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from "vue";
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
const tempCoords = ref(null);

const pickerMapRef = ref(null);
const staticMapRef = ref(null);

let pickerMap = null;
let staticMap = null;

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
  tempCoords.value = null;
  if (pickerMap) {
    pickerMap.off();
    pickerMap.remove();
    pickerMap = null;
  }
}

function updateCrosshairCoords() {
  if (!pickerMap) return;
  const center = pickerMap.getCenter();
  tempCoords.value = { lat: center.lat, lng: center.lng };
}

function initPicker() {
  if (!pickerMapRef.value || pickerMap) return;

  try {
    pickerMap = L.map(pickerMapRef.value, {
      center: [coords.value.lat, coords.value.lng],
      zoom: 13,
      zoomControl: false
    });
    
    // Add zoom control to top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(pickerMap);
    
    addTileLayer(pickerMap);

    // Update coordinates when map moves
    pickerMap.on('move', updateCrosshairCoords);
    pickerMap.on('moveend', updateCrosshairCoords);
    
    // Initial coordinate update
    updateCrosshairCoords();

    // Force map to recalculate size
    setTimeout(() => {
      if (pickerMap) {
        pickerMap.invalidateSize();
        updateCrosshairCoords();
      }
    }, 200);
  } catch (error) {
    console.error("Error initializing picker map:", error);
  }
}

function saveLocation() {
  if (!tempCoords.value) return;
  
  coords.value = { ...tempCoords.value };
  picked.value = true;
  
  closeModal();
  nextTick(() => {
    setTimeout(initStatic, 150);
  });
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

.btn-save {
  background: #28a745;
}

.btn-save:hover {
  background: #218838;
}

/* Full Screen Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.modal {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #333;
}

/* Map Container with Crosshair */
.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-fullscreen {
  width: 100%;
  height: 100%;
  background: #e5e5e5;
}

/* Crosshair */
.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000;
}

.crosshair-horizontal,
.crosshair-vertical {
  position: absolute;
  background: #ff4444;
  box-shadow: 0 0 0 2px white, 0 0 8px rgba(0, 0, 0, 0.3);
}

.crosshair-horizontal {
  width: 80px;
  height: 3px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.crosshair-vertical {
  width: 3px;
  height: 80px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.crosshair-center {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid #ff4444;
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.1);
  box-shadow: 0 0 0 2px white, 0 0 8px rgba(0, 0, 0, 0.3);
}

/* Modal Footer */
.modal-footer {
  padding: 1rem 1.5rem;
  background: #fff;
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.coords-display {
  margin-bottom: 1rem;
  font-family: monospace;
  color: #333;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.modal-actions .btn {
  flex: 1;
  max-width: 200px;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1rem;
  }
  
  .coords-display {
    font-size: 0.9rem;
  }
  
  .crosshair-horizontal {
    width: 60px;
  }
  
  .crosshair-vertical {
    height: 60px;
  }
  
  .crosshair-center {
    width: 16px;
    height: 16px;
  }
}
</style>
