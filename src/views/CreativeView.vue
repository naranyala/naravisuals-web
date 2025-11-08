<template>
  <div>
    <h1>Mostly created with Inkscape 2D Editor</h1>
    <div class="gallery">
      <div v-for="(image, index) in images" :key="image.url" class="item">
        <div class="image-wrapper">
          <!-- Spinner -->
          <div v-if="!image.loaded" class="spinner"></div>
          <!-- Image -->
          <img 
            :src="image.url" 
            :alt="image.caption" 
            loading="lazy" 
            @click="openLightbox(index)" 
            @load="handleImageLoad(index)"
            :class="{ 'loaded': image.loaded }"
          />
        </div>
        <p class="caption">{{ image.caption }}</p>
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
      <button class="nav prev" @click.stop="prevImage">‹</button>
      
      <!-- Lightbox Spinner -->
      <div v-if="!lightboxLoaded" class="spinner lightbox-spinner"></div>
      <img 
        :src="images[currentIndex].url" 
        :alt="images[currentIndex].caption"
        @load="handleLightboxLoad"
        :class="{ 'loaded': lightboxLoaded }"
      />
      
      <button class="nav next" @click.stop="nextImage">›</button>
      <p class="caption">{{ images[currentIndex].caption }}</p>
      <button class="close" @click="closeLightbox">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const images = ref([
  { url: "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg", caption: "Aurora Borealis Sky", loaded: false },
  { url: "https://cdn.pixabay.com/photo/2016/11/29/09/25/car-1868352_1280.jpg", caption: "Vintage Car on Road", loaded: false },
  { url: "https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg", caption: "Desert Sand Dunes", loaded: false },
  { url: "https://cdn.pixabay.com/photo/2018/01/22/14/19/coding-3098380_1280.jpg", caption: "Web Development Code", loaded: false },
  { url: "https://images.pexels.com/photos/1908852/pexels-photo-1908852.jpeg", caption: "Neon Sign in Rain", loaded: false },
  { url: "https://cdn.pixabay.com/photo/2018/05/29/21/53/blueberries-3440748_1280.jpg", caption: "Fresh Blueberries", loaded: false },
  { url: "https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg", caption: "Autumn Forest Canopy", loaded: false },
  { url: "https://cdn.pixabay.com/photo/2017/08/29/18/43/social-media-2694769_1280.jpg", caption: "Social Media Icons", loaded: false },
  { url: "https://images.pexels.com/photos/259915/pexels-photo-259915.jpeg", caption: "Modern Abstract Architecture", loaded: false },
  { url: "https://cdn.pixabay.com/photo/2017/05/17/10/43/student-2320473_1280.jpg", caption: "People Brainstorming", loaded: false },
  { url: "https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg", caption: "Tropical Beach Sunset", loaded: false },
  { url: "https://cdn.pixabay.com/photo/2016/09/01/08/24/ink-1635391_1280.jpg", caption: "Colorful Ink in Water", loaded: false },
  { url: "https://images.pexels.com/photos/208359/pexels-photo-208359.jpeg", caption: "Globe and Technology", loaded: false },
  { url: "https://cdn.pixabay.com/photo/2017/04/18/19/33/abstract-2240502_1280.jpg", caption: "Minimalist Pastel Shapes", loaded: false },
  { url: "https://images.pexels.com/photos/414645/pexels-photo-414645.jpeg", caption: "Old World Map Texture", loaded: false },
]);

const lightboxOpen = ref(false);
const currentIndex = ref(0);
const lightboxLoaded = ref(false);

function handleImageLoad(index) {
  images.value[index].loaded = true;
}

function handleLightboxLoad() {
  lightboxLoaded.value = true;
}

function openLightbox(index) {
  currentIndex.value = index;
  lightboxOpen.value = true;
  lightboxLoaded.value = false; // Reset loading state
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function prevImage() {
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
  lightboxLoaded.value = false; // Reset loading state
}

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
  lightboxLoaded.value = false; // Reset loading state
}
</script>

<style>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.item {
  position: relative;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

/* Gallery images */
.item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.item img.loaded {
  opacity: 1;
}

/* Spinner */
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Lightbox styles */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lightbox img {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lightbox img.loaded {
  opacity: 1;
}

.lightbox-spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #fff;
}

.lightbox .caption {
  color: #fff;
  margin-top: 15px;
}

.lightbox .nav {
  position: absolute;
  top: 50%;
  font-size: 3rem;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  transform: translateY(-50%);
}

.lightbox .prev { left: 20px; }
.lightbox .next { right: 20px; }

.lightbox .close {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 2rem;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
