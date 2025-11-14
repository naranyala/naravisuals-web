<script setup>
import { ref } from 'vue'
const socialLinks = ref([
  { name: 'GitHub', url: 'https://github.com', icon: '💻' },
  { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
  { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
  { name: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
])
</script>

<template>
  <div class="social-section">
    <div class="social-container">
      <h2 class="social-title">Connect With Me</h2>
      <div class="social-links">
        <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank" rel="noopener noreferrer"
          class="social-link">
          <span class="social-icon">{{ social.icon }}</span>
          <span class="social-name">{{ social.name }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.social-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.social-container {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.social-title {
  font-size: 32px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 40px;
  letter-spacing: -0.5px;
}

.social-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.social-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 20px;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  text-decoration: none;
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(148, 163, 184, 0.1);
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
}

.social-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.social-link:hover::before {
  opacity: 1;
}

.social-link:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.social-link:active {
  transform: translateY(-2px);
}

.social-icon {
  font-size: 32px;
  line-height: 1;
  filter: grayscale(0.3);
  transition: all 0.3s ease;
}

.social-link:hover .social-icon {
  filter: grayscale(0);
  transform: scale(1.1);
}

.social-name {
  position: relative;
  z-index: 1;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .social-section {
    padding: 40px 16px;
    min-height: auto;
  }

  .social-title {
    font-size: 26px;
    margin-bottom: 30px;
  }

  .social-links {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .social-link {
    flex-direction: row;
    justify-content: flex-start;
    padding: 20px 24px;
    gap: 16px;
  }

  .social-icon {
    font-size: 28px;
  }

  .social-name {
    font-size: 16px;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 768px) {
  .social-container {
    max-width: 500px;
  }

  .social-links {
    gap: 14px;
  }
}
</style>
