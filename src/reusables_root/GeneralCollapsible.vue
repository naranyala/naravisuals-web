<template>
  <div class="collapsible-section dark-theme">
    <!-- Toggle Button -->
    <button class="toggle-btn" @click="isOpen = !isOpen" :aria-expanded="isOpen" aria-controls="about-content">
      <span>{{ props?.title || "title" }}</span>
      <span class="arrow" :class="{ rotated: isOpen }">▼</span>
    </button>

    <!-- Collapsible Content -->
    <div id="about-content" class="content" :class="{ 'is-open': isOpen }" ref="contentRef">
      <div class="content-inner">
        <p v-if="props?.strContent?.length" v-for="text in props?.strContent">{{ text }}</p>
        <p v-else>lorem ipsum</p>
        <!-- <p>Hello! I'm a passionate developer with 5+ years of experience building web applications. I specialize in -->
        <!--   Vue.js, TypeScript, and modern frontend architecture. </p> -->
        <!-- <p>My philosophy: "Write code that's easy to delete, not easy to extend." – Kevlin Henney</p> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'


const props = defineProps(["isOpen", "title", "strContent"])


const isOpen = ref(props?.isOpen || false) // Start open by default
const contentRef = ref(null)

// Handle smooth height animation
watch(isOpen, async (newVal) => {
  await nextTick()
  if (contentRef.value) {
    const content = contentRef.value
    if (newVal) {
      content.style.height = content.scrollHeight + 'px'
    } else {
      content.style.height = '0px'
    }
  }
}, { immediate: true })
</script>

<style scoped>
/* Dark Theme Variables */
:root {
  --dark-bg: #121212;
  --card-bg: #1e1e1e;
  --header-bg: #252525;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: gray;
  --hover-bg: #2a2a2a;
}

.collapsible-section {
  border: 1px solid gray;
  border-radius: 20px;
  margin: 5vh 20vw;
}

.dark-theme {
  background: var(--card-bg);
  color: var(--text-primary);
  /* border: 1px solid var(--border-color); */
  /* border-radius: 10px; */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toggle-btn {
  width: 100%;
  padding: 1.1rem 1.5rem;
  background: var(--header-bg);
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
  transition: background 0.25s ease;
  font-size: 1.05rem;
}

.toggle-btn:hover {
  background: var(--hover-bg);
}

.arrow {
  transition: transform 0.3s ease;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.rotated {
  transform: rotate(180deg);
}

.content {
  height: min-content;
  overflow: hidden;
  transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg);
}

.content-inner {
  padding: 1.5rem;
  line-height: 1.65;
  color: var(--text-secondary);
  font-size: 0.95rem;
  height: min-content;
}

/* Ensure content is visible when open */
.content.is-open {
  height: auto;
}
</style>
