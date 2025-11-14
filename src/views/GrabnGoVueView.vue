<script setup lang="ts">
import {ref, watch, onMounted} from "vue"
import CodeBlock from './reusables/CodeBlock.vue'

import Counter from "./grabn-go-content/Counter.vue"
import strCounter from "./grabn-go-content/Counter.vue?raw"

import DynamicStyling from "./grabn-go-content/DynamicStyling.vue"
import strDynamicStyling from "./grabn-go-content/DynamicStyling.vue?raw"

import strAccordion from "./grabn-go-content/Accordion.vue?raw"
import strAccordionUsage from "./grabn-go-content/AccordionUsage.vue?raw"
import AccordionUsage from "./grabn-go-content/AccordionUsage.vue"

interface Item {
  id: number
  title: string
  description: string
}
const items = ref<Item[]>([
  { id: 1, title: 'Counter', description: '' },
  { id: 2, title: 'Accordion', description: '' },
  { id: 3, title: 'DynamicStyling', description: '' },
])

const isOpen = ref(false)
const selected = ref<Item | null>(null)

const openDrawer = (item: Item) => {
  selected.value = item
  isOpen.value = true
}
const closeDrawer = () => {
  isOpen.value = false
  setTimeout(() => (selected.value = null), 300)
}

watch(isOpen, (open) => {
  if (open) {
    // store current scroll position
    document.body.dataset.scrollY = window.scrollY.toString()
    // add class that disables scroll on <body>
    document.body.classList.add('no-scroll')
  } else {
    // restore scroll
    document.body.classList.remove('no-scroll')
    const saved = Number(document.body.dataset.scrollY ?? '0')
    window.scrollTo(0, saved)
  }
}, { immediate: false })

</script>


<template>
  <div class="container dark-theme">
    <!-- ==== ITEM LIST (now dark) ==== -->
    <ul class="item-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="item"
        @click="openDrawer(item)"
      >
        {{ item.title }}
      </li>
    </ul>

    <!-- ==== BACKDROP + DRAWER (dark) ==== -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="isOpen" class="backdrop" @click="closeDrawer" />
      </Transition>

      <Transition name="drawer">
        <div v-if="isOpen" class="drawer dark-theme">
          <div class="drawer-header">
            <h2>{{ selected?.title }}</h2>
            <button class="close-btn" @click="closeDrawer">✕</button>
          </div>

          <div class="drawer-body">
            <div v-if="selected?.title == 'Counter'" class="comp-demo">
                <Counter/>
                <CodeBlock language="js" :code="strCounter" label="Counter.vue"/>
            </div>
            <div v-if="selected?.title == 'Accordion'" class="comp-demo">
                <AccordionUsage/>
                <CodeBlock language="js" :code="strAccordion" label="Accordion.vue" />
                <CodeBlock language="js" :code="strAccordionUsage" label="AccordionUsage.vue" />
            </div>
            <div v-if="selected?.title == 'DynamicStyling'" class="comp-demo">
                <DynamicStyling/>
                <CodeBlock language="js" :code="strDynamicStyling" label="DynamicStyling.vue" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>


<style scoped>
/* -------------------------------------------------
   Global Dark Theme Base
   ------------------------------------------------- */
.dark-theme {
  background: #121212;
  color: #e0e0e0;
}

/* -------------------------------------------------
   Container & List
   ------------------------------------------------- */
.container {
  /* max-width: 420px; */
  /* margin: 2rem auto; */
  /* padding: 0 1rem; */
  /* min-height: 100vh; */
  border: 1px solid lightgray;
  border-radius: 10px;
}
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.item {
  padding: 1.25rem 1.5rem;
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
  font-weight: 500;
}
.item:hover {
  background: #2a2a2a;
}
.item:last-child {
  border-bottom: none;
}

/* -------------------------------------------------
   Backdrop
   ------------------------------------------------- */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  z-index: 1000;
}
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* -------------------------------------------------
   Drawer (Dark Theme)
   ------------------------------------------------- */
.drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 90vh;
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.4);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Slide animation */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}

/* Dark theme overrides */
.drawer.dark-theme {
  background: #1a1a1a;
  color: #e0e0e0;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #1e1e1e;
  border-bottom: 1px solid #333;
}
.drawer-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #aaaaaa;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
}
.close-btn:hover {
  background: #333;
  color: #fff;
}

.drawer-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: #1a1a1a;
  font-size: 1rem;
  line-height: 1.6;
}

/* Scrollbar (Webkit) */
.drawer-body::-webkit-scrollbar {
  width: 6px;
}
.drawer-body::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}
.drawer-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}


.comp-demo { 
  display: grid;
  gap: 20px;
  margin: 20px auto; 
  text-align: center;
  padding: 20px 0 20px 0;
}

.no-scroll {
  position: fixed;      /* freeze the page */
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;     /* hide any overflow */
  width: 100%;
}

/* Drawer body already scrolls (unchanged) */
.drawer-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;     /* ← this is the only scrollable area */
  background: #1a1a1a;
  /* …rest of your styles… */
}
</style>
