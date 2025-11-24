<script setup>
import { ref } from 'vue';

const selectedItem = ref(null);
const isDarkTheme = ref(true);
const showModal = ref(false);

const mainDesc = ref("koleksi artikel di bawah ini ditujukan untuk memetakkan perjalan manusia dalam upaya bertahan dengan kondisi alam dan kondisi sosial yang senantiasa berubah, dituntut untuk beradaptasi, bertahan, dan menang.")

const sections = ref([
  {
    title: "1. Early Humanity & Stone Ages",
    items: [
      { date: "3.5M YA", event: "First stone tools (scavenging)" },
      { date: "1.8M YA", event: "Fire + migration; cooking boosts brain development" },
      { date: "300K YA", event: "Homo sapiens emerges" },
      { date: "70K YA", event: "Toba bottleneck (genetic reset)" },
      { date: "60K YA", event: "Out of Africa migration (coastal routes)" },
      { date: "50K YA", event: "Australia colonized (rafts)" },
      { date: "40K YA", event: "Europe colonized; Neanderthal decline" },
      { date: "15K YA", event: "Cave art peak (Lascaux)" },
      { date: "12K YA", event: "End of Ice Age → megafauna extinction" },
      { date: "10K YA", event: "Agriculture begins → end of pure survival mode" }
    ]
  },
  {
    title: "2. Early Agriculture, Late Neolithic & Medieval",
    items: [
      { date: "10,000 BCE", event: "First farms (Fertile Crescent)" },
      { date: "8,000 BCE", event: "Jericho: first walled town" },
      { date: "6,000 BCE", event: "Copper tools + megaliths" },
      { date: "5,000 BCE", event: "Wheel invented (Mesopotamia)" },
      { date: "4,000 BCE", event: "Sumer: cities, writing, war" },
      { date: "3,000 BCE", event: "Bronze Age begins" },
      { date: "1,200 BCE", event: "Bronze Age collapse → Iron Age" },
      { date: "500 CE", event: "Fall of Rome → 'Dark Ages'" },
      { date: "800 CE", event: "Viking expansion (trade + raids)" },
      { date: "1000 CE", event: "Medieval warm period → population boom" },
      { date: "1347 CE", event: "Black Death → social reset" },
      { date: "1440 CE", event: "Gutenberg printing press" },
      { date: "1492 CE", event: "Columbus → end of medieval isolation" }
    ]
  },
  {
    title: "3. Kingdoms, Empires & Exploration Era",
    items: [
      { date: "1415", event: "Portugal captures Ceuta (start of global exploration)" },
      { date: "1453", event: "Constantinople falls, spice routes blocked" },
      { date: "1492", event: "Columbus reaches the Americas" },
      { date: "1494", event: "Treaty of Tordesillas divides the world" },
      { date: "1498", event: "Vasco da Gama reaches India" },
      { date: "1519–1522", event: "Magellan expedition: first circumnavigation" },
      { date: "1577", event: "Drake circumnavigates + plunder economy" },
      { date: "1602", event: "Dutch VOC: early global capitalism" },
      { date: "1620", event: "Mayflower lands in New England (colonization begins)" },
      { date: "1688", event: "Glorious Revolution → constitutional monarchy" },
      { date: "1740", event: "Scurvy cracked (Anson era)" },
      { date: "1768", event: "Cook maps Pacific; scurvy eliminated" },
      { date: "1776", event: "American Revolution (shift in global power)" }
    ]
  },
  {
    title: "4. Industrial, Modern & Digital Eras",
    items: [
      { date: "1769", event: "Watt's steam engine (Industrial Revolution)" },
      { date: "1804", event: "Napoleon crowned emperor" },
      { date: "1859", event: "Darwin's Origin of Species" },
      { date: "1876", event: "Bell invents telephone" },
      { date: "1913", event: "Ford assembly line + income tax" },
      { date: "1914–1918", event: "WWI (empires collapse)" },
      { date: "1929", event: "Wall Street Crash" },
      { date: "1939–1945", event: "WWII → nuclear age begins" },
      { date: "1944", event: "Bretton Woods (USD becomes world currency)" },
      { date: "1969", event: "Moon landing" },
      { date: "1971", event: "Gold standard ends → fiat era begins" },
      { date: "1989", event: "World Wide Web invented; Berlin Wall falls" },
      { date: "2001", event: "9/11 → War on Terror" },
      { date: "2008", event: "Financial crisis + Bitcoin whitepaper" },
      { date: "2020", event: "COVID → remote work + economic shocks" },
      { date: "2023", event: "AI boom (GPT era) → job disruption" },
      { date: "2025", event: '"You are here" → AGI on horizon?' }
    ]
  }
]);

const openModal = (sectionIdx, itemIdx) => {
  selectedItem.value = { sectionIdx, itemIdx };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
};
</script>

<template>
  <div :class="['app-container', { 'dark-theme': isDarkTheme }]">
    <div class="content-wrapper">
      <!-- Theme Toggle -->
      <div class="theme-toggle-wrapper">
        <button class="theme-toggle-btn" @click="toggleTheme">
          {{ isDarkTheme ? '☀️ Light Mode' : '🌙 Dark Mode' }}
        </button>
      </div>

      <div class="article-card">
        <!-- Header -->
        <div class="article-header">
          <p class="article-description">
                        {{mainDesc}}
          </p>
          <h1 class="article-title">
            Human Survival Timeline — Compact Edition
          </h1>
        </div>

        <!-- Content -->
        <div class="article-content">
          <div
            v-for="(section, sectionIdx) in sections"
            :key="sectionIdx"
            class="section"
          >
            <!-- Section Title -->
            <h2 class="section-title">{{ section.title }}</h2>

            <!-- Timeline Items -->
            <div class="timeline-items">
              <div
                v-for="(item, itemIdx) in section.items"
                :key="itemIdx"
                @click="openModal(sectionIdx, itemIdx)"
                class="timeline-item"
              >
                <span class="timeline-date">{{ item.date }}</span>
                <span class="timeline-event">→ {{ item.event }}</span>
              </div>
            </div>

            <!-- Section Divider -->
            <div v-if="sectionIdx < sections.length - 1" class="section-divider">
              <div class="divider-line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">✕</button>
        
        <div v-if="selectedItem" class="modal-body">
          <h2 class="modal-title">
            {{ sections[selectedItem.sectionIdx].items[selectedItem.itemIdx].date }}
          </h2>
          <p class="modal-description">
            {{ sections[selectedItem.sectionIdx].items[selectedItem.itemIdx].event }}
          </p>
          
          <div class="modal-placeholder">
            <p>Content will be displayed here...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  padding: 2rem;
  background: #f3f4f6;
  transition: background-color 0.3s ease;
}

.app-container.dark-theme {
  background: #111827;
}

.content-wrapper {
  max-width: 1024px;
  margin: 0 auto;
}

.theme-toggle-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.theme-toggle-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #374151;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark-theme .theme-toggle-btn {
  background: #1f2937;
  color: #e5e7eb;
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.article-card {
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  background: white;
  transition: background-color 0.3s ease;
}

.dark-theme .article-card {
  background: #1f2937;
}

.article-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
  transition: border-color 0.3s ease;
}

.dark-theme .article-header {
  border-bottom-color: #374151;
}

.article-description {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.625;
  color: #6b7280;
  transition: color 0.3s ease;
    text-align: center;
}

.dark-theme .article-description {
  color: #9ca3af;
}

.highlight {
  font-weight: 600;
  color: #2563eb;
  transition: color 0.3s ease;
}

.dark-theme .highlight {
  color: #60a5fa;
}

.article-title {
  font-size: 1.875rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: bold;
  color: #111827;
  margin: 0;
  transition: color 0.3s ease;
}

.dark-theme .article-title {
  color: #f3f4f6;
}

.article-content {
  padding: 1.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.25rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: bold;
  color: #111827;
  margin: 0 0 1rem 0;
  transition: color 0.3s ease;
}

.dark-theme .section-title {
  color: #f3f4f6;
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeline-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-item:hover {
  background: #f9fafb;
  transform: translateX(4px);
}

.dark-theme .timeline-item:hover {
  background: rgba(55, 65, 81, 0.5);
}

.timeline-date {
  font-weight: 600;
  min-width: 110px;
  color: #111827;
  transition: color 0.3s ease;
}

.dark-theme .timeline-date {
  color: #d1d5db;
}

.timeline-event {
  flex: 1;
  color: #374151;
  transition: color 0.3s ease;
}

.dark-theme .timeline-event {
  color: #9ca3af;
}

.section-divider {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.divider-line {
  width: 16rem;
  height: 1px;
  background: #d1d5db;
  transition: background-color 0.3s ease;
}

.dark-theme .divider-line {
  background: #374151;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.dark-theme .modal-content {
  background: #1f2937;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #374151;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.dark-theme .modal-close {
  background: #374151;
  color: #f3f4f6;
}

.modal-close:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.dark-theme .modal-close:hover {
  background: #4b5563;
}

.modal-body {
  padding: 3rem;
}

.modal-title {
  font-size: 2.5rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: bold;
  color: #111827;
  margin: 0 0 1rem 0;
}

.dark-theme .modal-title {
  color: #f3f4f6;
}

.modal-description {
  font-size: 1.25rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.8;
}

.dark-theme .modal-description {
  color: #9ca3af;
}

.modal-placeholder {
  padding: 4rem 2rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  text-align: center;
  color: #9ca3af;
  font-size: 1.125rem;
}

.dark-theme .modal-placeholder {
  background: #111827;
  color: #6b7280;
}
</style>
