<template>
  <footer class="footer">
    <div class="footer-links">
      <a v-for="item in links" :key="item.label" :href="item.href" class="link-item">
        {{ item.label }}
      </a>
    </div>

    <p class="footer-copyright">© 2025 gema_naranyala</p>


    <ScrollToTop/>
  </footer>
</template>

<script setup>

import ScrollToTop from "./ScrollToTop.vue"

const links = [
  { label: 'menu', href: '#' },
  { label: 'profile', href: '#' },
  { label: 'gallery', href: '#' },
  { label: 'connect', href: '#' },
];
</script>

<style scoped>
.footer {
  text-align: center;
  padding-top: 1.2rem;
  padding-bottom: 120px;
  background-color: #121212;
  color: #b0b0b0;
  font-size: 1.05rem;
  border-top: 1px solid #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.footer-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.8rem;
  margin-bottom: 1.4rem;
}

.link-item {
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.link-item:hover,
.link-item:focus {
  color: #4da6ff;
  outline: none;
}

.footer-copyright {
  margin: 0;
  color: #888;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
  margin-bottom: 20px;
}

/* Responsive touch optimization */
@media (max-width: 480px) {
  .footer {
    padding: 1rem 0.75rem;
  }

  .footer-links {
    gap: 0.8rem;
  }
}
</style>
