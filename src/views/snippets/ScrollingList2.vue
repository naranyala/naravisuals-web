<template>
  <div
    ref="scrollContainer"
    class="virtual-scroll-container"
    @scroll="handleScroll"
    :style="{ height: containerHeight + 'px' }"
  >
    <div
      class="virtual-scroll-content"
      :style="{ height: totalHeight + 'px' }"
    >
      <div
        v-for="visibleItem in visibleItems"
        :key="getItemKey(visibleItem)"
        class="virtual-item"
        :style="getItemStyle(visibleItem.index)"
      >
        <slot
          name="item"
          :item="visibleItem.data"
          :index="visibleItem.index"
        >
          {{ visibleItem.data }}
        </slot>
      </div>
    </div>

    <!-- Loading states -->
    <div v-if="loading" class="virtual-loading">
      <LoadingSpinner />
      <span>Loading more items...</span>
    </div>

    <div v-if="!hasMore && items.length > 0" class="virtual-end">
      No more items to load
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  itemHeight: {
    type: Number,
    default: 50
  },
  containerHeight: {
    type: Number,
    default: 400
  },
  overscan: {
    type: Number,
    default: 5
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  getItemKey: {
    type: Function,
    default: (item, index) => index
  }
})

const emit = defineEmits(['load-more'])

const scrollContainer = ref(null)
const scrollTop = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleRange = computed(() => {
  const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan)
  const endIndex = Math.min(
    props.items.length - 1,
    Math.floor((scrollTop.value + props.containerHeight) / props.itemHeight) + props.overscan
  )
  
  return { startIndex, endIndex }
})

const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value
  return props.items
    .slice(startIndex, endIndex + 1)
    .map((item, index) => ({
      data: item,
      index: startIndex + index
    }))
})

const getItemStyle = (index) => ({
  height: `${props.itemHeight}px`,
  transform: `translateY(${index * props.itemHeight}px)`
})

const handleScroll = (event) => {
  scrollTop.value = event.target.scrollTop
  
  // Check if we need to load more items
  const scrollBottom = event.target.scrollTop + event.target.clientHeight
  if (scrollBottom >= event.target.scrollHeight - 100 && props.hasMore && !props.loading) {
    emit('load-more')
  }
}

// Auto-scroll to specific item
const scrollToIndex = (index) => {
  if (scrollContainer.value) {
    const scrollPosition = index * props.itemHeight
    scrollContainer.value.scrollTo({ top: scrollPosition, behavior: 'smooth' })
  }
}

// Scroll to bottom
const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ 
      top: scrollContainer.value.scrollHeight, 
      behavior: 'smooth' 
    })
  }
}

defineExpose({
  scrollToIndex,
  scrollToBottom
})
</script>

<style scoped>
.virtual-scroll-container {
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  position: relative;
}

.virtual-scroll-content {
  position: relative;
}

.virtual-item {
  position: absolute;
  left: 0;
  right: 0;
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 16px;
  box-sizing: border-box;
}

.virtual-item:last-child {
  border-bottom: none;
}

.virtual-loading,
.virtual-end {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6b7280;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.virtual-loading {
  gap: 8px;
}
</style>
