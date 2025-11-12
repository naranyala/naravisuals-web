<script setup>
import { ref } from 'vue'

const items = ref([
  {
    title: 'What is Vue.js?',
    content: 'Vue.js is a progressive JavaScript framework for building user interfaces. It is designed to be incrementally adoptable and focuses on the view layer, making it easy to integrate with other libraries or existing projects.',
    expanded: true
  },
  {
    title: 'What is the Composition API?',
    content: 'The Composition API is a set of APIs that allows you to author Vue components using imported functions instead of declaring options. It provides better logic reuse, more flexible code organization, and better TypeScript inference.',
    expanded: true
  },
  {
    title: 'What is script setup?',
    content: 'Script setup is a compile-time syntactic sugar for using the Composition API inside Single File Components. It provides a more ergonomic syntax and better runtime performance with less boilerplate code.',
    expanded: true
  },
  {
    title: 'Why use Vue 3?',
    content: 'Vue 3 offers improved performance, better TypeScript support, new features like Teleport and Suspense, a more modular architecture, and the powerful Composition API for better code organization in large applications.',
    expanded: true
  }
])

const toggle = (index) => {
  items.value[index].expanded = !items.value[index].expanded
}

const expandAll = () => {
  items.value.forEach(item => item.expanded = true)
}

const collapseAll = () => {
  items.value.forEach(item => item.expanded = false)
}
</script>

<template>
  <div class="accordion-wrapper">

    <div class="accordion">
      <div v-for="(item, index) in items" :key="index" class="accordion-item">
        <button 
          class="accordion-header"
          @click="toggle(index)"
          :aria-expanded="item.expanded"
        >
          <span>{{ item.title }}</span>
          <svg 
            class="accordion-icon"
            :class="{ expanded: item.expanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          class="accordion-content"
          :class="{ expanded: item.expanded }"
        >
          <div class="accordion-content-inner">
            {{ item.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #1f2937;
  text-align: center;
  margin-bottom: 30px;
  font-size: clamp(24px, 5vw, 32px);
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.btn-expand {
  background: #667eea;
  color: white;
}

.btn-expand:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-collapse {
  background: #764ba2;
  color: white;
}

.btn-collapse:hover {
  background: #653a8a;
  transform: translateY(-1px);
}

.accordion {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.accordion-item {
  border-bottom: 1px solid #e5e7eb;
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-header {
  width: 100%;
  padding: 20px;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.accordion-header:hover {
  background: #f9fafb;
}

.accordion-header:active {
  background: #f3f4f6;
}

.accordion-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 10px;
}

.accordion-icon.expanded {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion-content.expanded {
  max-height: 1000px;
}

.accordion-content-inner {
  padding: 20px;
  color: #4b5563;
  line-height: 1.6;
  font-size: 15px;
}

@media (max-width: 640px) {
  .accordion-wrapper {
    padding: 15px;
  }

  .accordion-header {
    padding: 16px;
    font-size: 15px;
  }

  .accordion-content-inner {
    padding: 16px;
    font-size: 14px;
  }

  .btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>
