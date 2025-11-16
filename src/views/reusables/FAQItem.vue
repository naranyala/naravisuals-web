
<template>
  <div class="faq-item">
    <div class="faq-header" @click="toggle">
      <span>{{ item.question }}</span>
      <span class="chevron" :class="{ open: openState }">⌄</span>
    </div>

    <div v-if="openState" class="faq-body">
      <!-- Simple answer -->
      <p v-if="item.answer" class="faq-answer">
        {{ item.answer }}
      </p>

      <!-- Nested items -->
      <FAQList
        v-if="item.children"
        :items="item.children"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import FAQList from "./FAQList.vue"

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const openState = ref(false)
function toggle() {
  openState.value = !openState.value
}
</script>

<style scoped>
.faq-item {
  border: 1px solid #444;
  border-radius: 8px;
  overflow: hidden;
}

.faq-header {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  cursor: pointer;
  background: #1d1d1d;
  color: #eaeaea;
  transition: 0.15s ease;
}

.faq-header:hover {
  background: #252525;
}

.chevron {
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.faq-body {
  background: #141414;
  padding: 12px 16px;
  display: grid;
  gap: 12px;
}

.faq-answer {
  margin: 0;
  color: #cfcfcf;
  line-height: 1.4;
}
</style>
