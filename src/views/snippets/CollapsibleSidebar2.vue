<script setup lang="ts">
const collapsed = ref(false)
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <h2 v-if="!collapsed">My App</h2>
      <button @click="collapsed = !collapsed">☰</button>
    </div>
    <nav class="sidebar-nav">
      <slot />
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px; height: 100vh; background: #1e293b; color: white;
  transition: width 0.3s; padding: 1rem; position: fixed; left: 0; top: 0;
}
.sidebar.collapsed { width: 70px; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; }
.sidebar-nav a { display: block; padding: 0.75rem; border-radius: 8px; color: #cbd5e1; }
.sidebar.collapsed .sidebar-nav a span { display: none; }
</style>
