<script setup>
import { ref } from 'vue'

const socialLinks = ref([
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Twitter', url: 'https://twitter.com' },
  { name: 'LinkedIn', url: 'https://linkedin.com' },
  { name: 'Instagram', url: 'https://instagram.com' },
  { name: 'YouTube', url: 'https://youtube.com' },
  { name: 'Discord', url: 'https://discord.com' }
])
</script>

<template>
  <div class="social-section">
    <div class="social-links">
      <a
        v-for="social in socialLinks"
        :key="social.name"
        :href="social.url"
        target="_blank"
        rel="noopener noreferrer"
        class="social-link"
      >
        {{ social.name }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.social-section {
  padding-bottom: 150px;
  max-width: 800px;
  margin: 0 auto;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.social-link {
  padding: 12px 24px;
  background: #1f2937;
  border-radius: 8px;
  text-decoration: none;
  color: #f9fafb;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #374151;
  -webkit-tap-highlight-color: transparent;
}

.social-link:hover {
  background: #374151;
  transform: translateY(-2px);
}

.social-link:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .social-section {
    padding: 150px;
  }

  .social-links {
    gap: 10px;
  }

  .social-link {
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>
