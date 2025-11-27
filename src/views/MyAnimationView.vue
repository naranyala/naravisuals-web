<template>
  <div class="youtube-list">
    <div 
      v-for="video in videos" 
      :key="video.url"
      class="video-card"
    >
      <h3 class="video-title">{{ video.title }}</h3>
      <div class="video-wrapper">
        <!-- Loading spinner -->
        <div 
          v-if="loadingStates[video.url]" 
          class="loading-overlay"
        >
          <div class="spinner"></div>
        </div>

        <!-- YouTube iframe -->
        <iframe
          v-if="getVideoId(video.url)"
          class="youtube-iframe"
          :src="`https://www.youtube.com/embed/${getVideoId(video.url)}?autoplay=0&rel=0&modestbranding=1`"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          @load="() => setLoading(video.url, false)"
          @error="() => setLoading(video.url, false)"
          title="YouTube video player"
        ></iframe>

        <!-- Invalid URL fallback -->
        <div v-else class="invalid-url">
          Invalid YouTube URL
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Helper to extract video ID
const getVideoId = (url) => {
  if (!url) return null
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// Loading state: { [url]: true/false }
const loadingStates = ref({})

// Helper to update loading state
const setLoading = (url, isLoading) => {
  loadingStates.value[url] = isLoading
}

// Initialize loading states
const videos = [
  {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up'
  },
  {
    url: 'https://youtu.be/9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE'
  },
  {
    url: 'https://www.youtube.com/shorts/LXb3EKWsInQ',
    title: '4K Drone Footage - Iceland'
  },
]

// Set all videos to loading initially
onMounted(() => {
  videos.forEach(video => {
    loadingStates.value[video.url] = true
  })
})
</script>

<style scoped>
.youtube-list {
  /* display: grid; */
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.video-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.video-card:hover {
  transform: translateY(-4px);
}

.video-title {
  padding: 1rem;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  background: #f9fafb;
}

.video-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
}

/* iframe */
.youtube-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f1f1;
  z-index: 1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Invalid URL */
.invalid-url {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>
