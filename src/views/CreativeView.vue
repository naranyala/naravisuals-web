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
