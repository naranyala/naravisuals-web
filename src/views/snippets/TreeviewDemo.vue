<!-- TreeView.vue -->
<script setup lang="ts">
defineProps<{
  node: { label: string; children?: any[] }
  depth?: number
}>()

const open = ref(true)
</script>

<template>
  <div class="tree-node" :style="{ paddingLeft: `${(depth || 0) * 20}px` }">
    <div class="tree-label" @click="open = !open">
      <span v-if="node.children?.length" class="toggle">{{ open ? '▼' : '▶' }}</span>
      <span v-else class="bullet">•</span>
      {{ node.label }}
    </div>
    <Transition name="tree">
      <div v-if="open && node.children?.length" class="tree-children">
        <TreeView v-for="child in node.children" :key="child.label" :node="child" :depth="(depth || 0) + 1" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tree-label { cursor: pointer; padding: 4px 0; user-select: none; }
.toggle { margin-right: 8px; }
.tree-enter-active, .tree-leave-active { transition: all 0.3s; }
.tree-enter-from, .tree-leave-to { opacity: 0; height: 0; }
</style>
