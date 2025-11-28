<template>
  <div class="menu-grid">
    <div
      v-for="item in items"
      :key="item.label"
      class="menu-square"
      @click="handleClick(item)"
    >
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
// Declare props
const props = defineProps({
  items: {
    type: Array,
    required: true,
    // Each item: { label: string, action: function }
  }
})

const emit = defineEmits(["drawer-close"])

// Handle click
function handleClick(item) {
  emit('drawer-close')

  if (typeof item.action === 'function') {
    item.action()
  }
}
</script>

<style scoped>
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.menu-square {
  background-color: #42b883;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-square:hover {
  background-color: #2c8f6b;
}
</style>

