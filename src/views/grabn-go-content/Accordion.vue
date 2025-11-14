<template>
  <div :class="['accordion', theme]">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="accordion-item"
    >
      <button
        class="accordion-header"
        @click="toggle(index)"
      >
        <span>{{ item.title }}</span>
        <span class="accordion-icon">
          {{ activeIndex === index ? '−' : '+' }}
        </span>
      </button>

      <Transition name="fade">
        <div
          v-if="activeIndex === index"
          class="accordion-content"
        >
          <slot :name="`content-${index}`">
            {{ item.content }}
          </slot>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: (v) =>
      v.every((i) => 'title' in i && 'content' in i)
  },
  defaultOpen: {
    type: Number,
    default: -1
  },
  /** NEW PROP */
  dark: {
    type: Boolean,
    default: true   // <-- dark by default
  }
})

const activeIndex = ref(props.defaultOpen)

const toggle = (i) => {
  activeIndex.value = activeIndex.value === i ? -1 : i
}

/** Choose the root class based on the prop */
const theme = computed(() => (props.dark ? 'dark' : 'light'))
</script>

<style scoped>
/* ---------- LIGHT THEME (default Tailwind-like colors) ---------- */
.accordion.light {
  border: 1px solid #e2e8f0;
}
.accordion-item {
  border-bottom: 1px solid #e2e8f0;
}
.accordion-item:last-child {
  border-bottom: none;
}
.accordion-header {
  background: #f7fafc;
  color: #2d3748;
}
.accordion-header:hover {
  background: #edf2f7;
}
.accordion-content {
  background: white;
  color: #2d3748;
}

/* ---------- DARK THEME ---------- */
.accordion.dark {
  border: 1px solid #4a5568;
}
.accordion.dark .accordion-item {
  border-bottom-color: #4a5568;
}
.accordion.dark .accordion-header {
  background: #2d3748;
  color: #e2e8f0;
}
.accordion.dark .accordion-header:hover {
  background: #4a5568;
}
.accordion.dark .accordion-content {
  background: #1a202c;
  color: #e2e8f0;
}

/* ---------- COMMON STYLES ---------- */
.accordion {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}
.accordion-header {
  width: 100%;
  padding: 1rem;
  text-align: left;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s ease;
}
.accordion-icon {
  font-size: 1.2rem;
}
.accordion-content {
  padding: 1rem;
}

/* Fade transition (Vue <Transition>) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
