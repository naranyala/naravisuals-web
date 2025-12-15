
<!-- TagsDisplay.vue -->
<template>
  <div
    class="tags-container"
    :class="alignmentClass"
  >
    <span
      v-for="tag in tags"
      :key="tag.name"
      class="tag"
    >
      <span class="tag-name">{{ tag.name }}</span>
      <span class="tag-count">{{ tag.count }}</span>
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  tags: {
    type: Array,
    required: true,
  },
  align: {
    type: String,
    default: "left",
    validator: (v) => ["left", "center", "right"].includes(v),
  },
});

const alignmentClass = computed(() => {
  switch (props.align) {
    case "center":
      return "align-center";
    case "right":
      return "align-right";
    default:
      return "align-left";
  }
});
</script>

<style scoped>
/* container alignment */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.align-left {
  justify-content: flex-start;
}

.align-center {
  justify-content: center;
}

.align-right {
  justify-content: flex-end;
}

/* dark theme (default) */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  margin: 16px 0;
  border-radius: 16px;
  background-color: #1e1e1e;
  color: #e6e6e6;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.tag:hover {
  background-color: #2a2a2a;
  transform: translateY(-1px);
}

.tag-name {
  font-weight: 500;
}

.tag-count {
  background-color: #333333;
  color: #bdbdbd;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
}
</style>
