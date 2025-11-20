
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  direction: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value),
  },
  initialSize: {
    type: Number,
    default: 200,
  },
});

const size = ref(props.initialSize);
const isResizing = ref(false);

const startResize = () => {
  isResizing.value = true;
};

const stopResize = () => {
  isResizing.value = false;
};

const resize = (e) => {
  if (!isResizing.value) return;
  size.value = props.direction === 'horizontal' ? e.clientX : e.clientY;
};

onMounted(() => {
  window.addEventListener('mousemove', resize);
  window.addEventListener('mouseup', stopResize);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', resize);
  window.removeEventListener('mouseup', stopResize);
});
</script>

<template>
  <div
    class="resizable-panel"
    :style="{
      width: direction === 'horizontal' ? size + 'px' : '100%',
      height: direction === 'vertical' ? size + 'px' : '100%',
    }"
  >
    <slot></slot>
    <div
      class="resize-handle"
      :class="direction"
      @mousedown="startResize"
    ></div>
  </div>
</template>

<style scoped>
.resizable-panel {
  position: relative;
  overflow: hidden;
}
.resize-handle {
  position: absolute;
  background: #ccc;
  z-index: 10;
}
.resize-handle.horizontal {
  width: 5px;
  height: 100%;
  right: 0;
  top: 0;
  cursor: ew-resize;
}
.resize-handle.vertical {
  width: 100%;
  height: 5px;
  bottom: 0;
  left: 0;
  cursor: ns-resize;
}
</style>
