
<template>
  <div class="grid-menu">
    <div 
      v-for="item in menuItems" 
      :key="item.id"
      class="menu-item"
      @click="handleClick(item.id)"
    >
      <div class="icon">{{ item.icon }}</div>
      <div class="label">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Menu data
const menuItems = ref([
  { id: 'apps', label: 'Apps', icon: '🧩' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'mouse', label: 'Mouse', icon: '🖱️' },
  { id: 'keyboard', label: 'Keyboard', icon: '⌨️' },
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'network', label: 'Network', icon: '🌐' },
  { id: 'bluetooth', label: 'Bluetooth', icon: '🔵' },
  { id: 'power', label: 'Power', icon: '🔋' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
  { id: 'system', label: 'System', icon: '⚙️' }
])

// Handle menu item clicks
const handleClick = (id) => {
  console.log('Selected:', id)
  // Add your navigation logic here
}
</script>

<style scoped>
.grid-menu {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.menu-item {
  width: auto;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.menu-item:hover {
  border-color: #0078d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.menu-item:active {
  transform: translateY(0);
}

.icon {
  font-size: 28px;
  margin-bottom: 12px;
  line-height: 1;
}

.label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  letter-spacing: 0.3px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-menu {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    padding: 20px;
  }
  
  .menu-item {
    padding: 20px 12px;
  }
  
  .icon {
    font-size: 24px;
  }
  
  .label {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .grid-menu {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
}
</style>
