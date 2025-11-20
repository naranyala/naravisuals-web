
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  itemHeight: {
    type: Number,
    required: true,
  },
  visibleItems: {
    type: Number,
    default: 10,
  },
});

const scrollTop = ref(0);
const containerRef = ref(null);

const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight);
  const end = start + props.visibleItems;
  return { start, end };
});

const handleScroll = () => {
  scrollTop.value = containerRef.value.scrollTop;
};

onMounted(() => {
  containerRef.value.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  containerRef.value.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-scroller"
    :style="{ height: visibleItems * itemHeight + 'px', overflow: 'auto' }"
  >
    <div :style="{ height: items.length * itemHeight + 'px', position: 'relative' }">
      <div
        v-for="(item, index) in items.slice(visibleRange.start, visibleRange.end)"
        :key="index + visibleRange.start"
        :style="{ position: 'absolute', top: (index + visibleRange.start) * itemHeight + 'px', height: itemHeight + 'px' }"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>
