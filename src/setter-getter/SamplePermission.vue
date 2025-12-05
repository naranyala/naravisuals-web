<template>
  <div>
    <h3>Permissions Status</h3>
    <div>
      <p>Geolocation: {{ geoPermission.getStatus() }}</p>
      <button @click="requestGeo" :disabled="!geoPermission.isSupported || geoPermission.isGranted()">
        Request Geolocation
      </button>
    </div>

    <div>
      <p>Notifications: {{ notificationPermission.getStatus() }}</p>
      <button @click="requestNotifications" :disabled="notificationPermission.isDenied()">
        Request Notifications
      </button>
    </div>

    <select @change="changePermission">
      <option value="geolocation">Geolocation</option>
      <option value="notifications">Notifications</option>
      <option value="camera">Camera</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePermission } from './usePermission'

const selectedPermission = ref('geolocation')
const geoPermission = usePermission('geolocation')
const notificationPermission = usePermission('notifications')

async function requestGeo() {
  const granted = await geoPermission.request()
  if (granted) {
    alert('Geolocation permission granted!')
  }
}

async function requestNotifications() {
  const granted = await notificationPermission.request()
  if (granted) {
    new Notification('Permission granted!')
  }
}

function changePermission(event) {
  const permission = event.target.value
  selectedPermission.value = permission

  // Switch to monitoring different permission
  geoPermission.set(permission)
}
</script>
