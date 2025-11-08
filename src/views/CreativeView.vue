<template>
  <div>
    <h1>Mostly created with Inkscape 2D Editor</h1>
    <div class="gallery">
      <div v-for="(image, index) in images" :key="image.url" class="item">
        <img 
          :src="image.url" 
          :alt="image.caption" 
          loading="lazy" 
          @click="openLightbox(index)" 
        />
        <p class="caption">{{ image.caption }}</p>
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
      <button class="nav prev" @click.stop="prevImage">‹</button>
      <img :src="images[currentIndex].url" :alt="images[currentIndex].caption" />
      <button class="nav next" @click.stop="nextImage">›</button>
      <p class="caption">{{ images[currentIndex].caption }}</p>
      <button class="close" @click="closeLightbox">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const images = ref([
  { url: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg", caption: "Mountain View" },
  { url: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg", caption: "Lonely Tree" },
  { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", caption: "Ocean Waves" }
]);

const lightboxOpen = ref(false);
const currentIndex = ref(0);

function openLightbox(index) {
  currentIndex.value = index;
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function prevImage() {
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
}

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
}
</script>

<style>
.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.item img {
  width: 250px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
}
.caption {
  text-align: center;
  margin-top: 5px;
  font-size: 14px;
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
  max-height: 90vh;
  max-width: 90vw;
  border-radius: 8px;
}
.lightbox .caption {
  color: #fff;
  margin-top: 10px;
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
