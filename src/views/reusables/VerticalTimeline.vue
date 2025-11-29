<!-- VerticalTimeline.vue -->
<template>
  <div class="timeline-container">
    <div class="timeline-line"></div>

    <div v-for="(item, index) in items" :key="index" class="timeline-item" :class="{ active: activeIndex === index }"
      @click="handleClick(index, item)">
      <div class="node"></div>

      <div class="content">
        <h3 class="title">{{ item.title }}</h3>
        <p class="desc" v-if="item.desc">{{ item.desc }}</p>

        <!-- Optional custom slot -->
        <slot name="extra" :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, required: true },
  activeIndex: { type: Number, default: -1 }
});

const emit = defineEmits(["select"]);

function handleClick(index, item) {
  emit("select", { index, item });
}
</script>

<style scoped>
.timeline-container {
  position: relative;
  padding-left: 40px;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 15px;
  width: 2px;
  background: #ccc;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  cursor: pointer;
  transition: 0.2s ease;
}

.timeline-item.active .node {
  background: #42b883;
  transform: scale(1.2);
}

.node {
  position: absolute;
  left: -2px;
  top: 4px;
  width: 14px;
  height: 14px;
  background: #999;
  border-radius: 50%;
  transition: 0.2s ease;
}

.content {
  margin-left: 24px;
}

.title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.desc {
  margin: 4px 0 0;
  color: #666;
}
</style>
