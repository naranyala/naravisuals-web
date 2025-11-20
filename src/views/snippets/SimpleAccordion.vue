
<template>
  <div class="accordion">
    <div v-for="(item, i) in items" :key="i">
      <button @click="toggle(i)">
        {{ item.title }}
      </button>
      <div v-show="openIndex === i">
        <slot :content="item.content">{{ item.content }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const openIndex = ref(null)
function toggle(i) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>
