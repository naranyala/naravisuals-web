<script setup lang="ts">
defineProps<{
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away'
  rounded?: boolean
}>()
</script>

<template>
  <div class="avatar-wrapper" :class="size">
    <div class="avatar" :class="{ rounded }">
      <img v-if="src" :src="src" alt="name" />
      <span v-else class="fallback">
        {{ name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?' }}
      </span>
    </div>
    <span v-if="status" :class="['status', status]"></span>
  </div>
</template>

<style scoped>
.avatar-wrapper { position: relative; display: inline-block; }
.avatar {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 3px solid white;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.fallback { font-weight: bold; color: #6b7280; font-size: 1.2em; }
.rounded { border-radius: 50%; }
.sm { width: 32px; height: 32px; }
.md { width: 48px; height: 48px; }
.lg { width: 80px; height: 80px; }
.xl { width: 120px; height: 120px; }

.status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  border: 3px solid white;
}
.online { background: #22c55e; }
.offline { background: #6b7280; }
.away { background: #eab308; }
</style>
