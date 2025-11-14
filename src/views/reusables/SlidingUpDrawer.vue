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
            <p>{{ selected?.description }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Item {
  id: number
  title: string
  description: string
}
const items = ref<Item[]>([
  { id: 1, title: 'Apple', description: 'A sweet red fruit.' },
  { id: 2, title: 'Banana', description: 'A yellow curved fruit.' },
  { id: 3, title: 'Cherry', description: 'Small and delicious.' },
  { id: 4, title: 'Date', description: 'Sweet and sticky.' },
  { id: 5, title: 'Elderberry', description: 'Used in jams.' },
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
</script>

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
</style>
