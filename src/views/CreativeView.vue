
<script setup>
import { ref } from 'vue';

const images = ref([
  { url: "https://loremflickr.com/480/360/sunset,aurora", caption: "LoremFlickr - Sunset Aurora Mix", loaded: false },
  { url: "https://loremflickr.com/480/360/northernlights", caption: "LoremFlickr - Pure Aurora", loaded: false },
  { url: "https://loremflickr.com/480/360/stars,night", caption: "LoremFlickr - Starry Night", loaded: false },
  { url: "https://loremflickr.com/480/360/landscape", caption: "LoremFlickr - Random Landscape", loaded: false },
  { url: "https://loremflickr.com/480/360/forest", caption: "LoremFlickr - Misty Forest", loaded: false },
  { url: "https://picsum.photos/seed/gema2025/500/400", caption: "Lorem Picsum - Seed Gema #1", loaded: false },
  { url: "https://picsum.photos/seed/gema2025_2/500/400", caption: "Lorem Picsum - Seed Gema #2", loaded: false },
  { url: "https://picsum.photos/seed/gema2025_3/500/400", caption: "Lorem Picsum - Seed Gema #3", loaded: false },
  { url: "https://picsum.photos/seed/gema2025_4/500/400", caption: "Lorem Picsum - Seed Gema #4", loaded: false },
  { url: "https://picsum.photos/seed/gema2025_5/500/400", caption: "Lorem Picsum - Seed Gema #5", loaded: false },
  { url: "https://images.weserv.nl/?w=450&h=350&il&output=webp&q=50&url=https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg", caption: "weserv.nl - Tiny Aurora #1", loaded: false },
  { url: "https://images.weserv.nl/?w=450&h=350&il&output=webp&q=50&url=https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg", caption: "weserv.nl - Tiny Forest Path", loaded: false },
  { url: "https://images.weserv.nl/?w=450&h=350&il&output=webp&q=50&url=https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg", caption: "weserv.nl - Tiny Milky Way", loaded: false },
  { url: "https://images.weserv.nl/?w=450&h=350&il&output=webp&q=50&url=https://images.pexels.com/photos/355747/pexels-photo-355747.jpeg", caption: "weserv.nl - Tiny Mountain Lake", loaded: false },
  { url: "https://images.weserv.nl/?w=450&h=350&il&output=webp&q=50&url=https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg", caption: "weserv.nl - Tiny Golden Gate", loaded: false }
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

<template>
  <div>
    <h1>Art Gallery</h1>
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


<style scoped>
/* === YOUR ORIGINAL STYLES (unchanged until print media) === */
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
.lightbox img.loaded { opacity: 1; }
.lightbox-spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #fff;
}
.lightbox .caption { color: #fff; margin-top: 15px; }
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

/* === PRINT STYLES – THIS IS THE MAGIC === */
@media print {
  @page {
    margin: 1.5cm;
    size: A4 portrait;
  }

  body, html {
    background: white !important;
    color: black !important;
    font-size: 12pt;
    line-height: 1.4;
  }

  /* Hide everything except the gallery */
  .lightbox,
  .nav,
  .close,
  .spinner,
  button,
  nav,
  header, footer, aside {
    display: none !important;
  }

  /* Show only the gallery */
  .gallery {
    display: block !important;
    grid-template-columns: none !important;
    gap: 40px !important;
    page-break-after: always;
  }

  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    page-break-inside: avoid;
    margin-bottom: 40px;
  }

  .image-wrapper {
    width: 100% !important;
    height: auto !important;
    background: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
    box-shadow: none !important;
  }

  .item img {
    width: 100% !important;
    height: auto !important;
    max-height: 70vh !important;
    object-fit: contain !important;
    opacity: 1 !important;
    cursor: default !important;
    display: block;
    margin: 0 auto;
    page-break-inside: avoid;
    border: 1px solid #ddd;
  }

  .caption {
    font-size: 14pt !important;
    font-weight: bold;
    text-align: center;
    margin-top: 15px !important;
    color: #000 !important;
    page-break-before: avoid;
  }

  h1 {
    text-align: center;
    font-size: 24pt;
    margin-bottom: 30px;
    page-break-after: avoid;
  }

  /* Optional: Add image number */
  .item::before {
    counter-increment: image;
    content: "Image " counter(image) " of " counter(images);
    font-size: 10pt;
    color: #555;
    margin-bottom: 8px;
  }

  /* Counter setup */
  body {
    counter-reset: image images;
  }
  .gallery {
    counter-reset: images 15; /* Change 15 to your actual image count */
  }
}

/* === OPTIONAL: Add a nice Print button === */
.print-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #000;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 50px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 999;
  transition: all 0.3s;
}
.print-button:hover {
  background: #333;
  transform: scale(1.05);
}
@media print {
  .print-button { display: none !important; }
}
</style>
