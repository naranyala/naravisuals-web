
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  loadMore: {
    type: Function,
    required: true,
  },
  hasMore: {
    type: Boolean,
    required: true,
  },
});

const observer = ref(null);
const root = ref(null);

const handleIntersect = (entries) => {
  if (entries[0].isIntersecting && props.hasMore) {
    props.loadMore();
  }
};

onMounted(() => {
  observer.value = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
  observer.value.observe(root.value);
});

onUnmounted(() => {
  if (observer.value) observer.value.disconnect();
});
</script>

<template>
  <div ref="root"></div>
</template>
