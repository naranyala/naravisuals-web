<script setup>
import { ref, watch } from 'vue'
import TheoryBadge from "./TheoryBadge.vue"

const props = defineProps({
  cards: {
    type: Object,
    required: true
  },
  shuffleTrigger: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(["shuffle-complete"])

// Start with original order
const displayedTheories = ref([
  ...props.cards.theories
])

const searchOnGoogle = (prefix, query) => {
  const url = `https://www.google.com/search?q=${prefix}+${encodeURIComponent(query.toLowerCase())}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Simple shuffle function
const shuffleTheories = () => {
  const theories = [...props.cards.theories]
  for (let i = theories.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [theories[i], theories[j]] = [theories[j], theories[i]]
  }
  displayedTheories.value = theories
  emit('shuffle-complete')
}

// Watch for shuffle trigger changes
watch(() => props.shuffleTrigger, () => {
  shuffleTheories()
})

// Also update when original cards change
watch(() => props.cards.theories, (newTheories) => {
  displayedTheories.value = [...newTheories]
})
</script>

<template>
  <div class="card-list">

    <!-- <div v-for="card, idx in displayedTheories" -->
      <div v-for="card in displayedTheories.slice(0, 5)"
      :key="card.id"
      class="card"
      @click="searchOnGoogle(props.cards.prefix, card.title)"
    >
      <div class="card-content">
        <!-- <h3 class="card-title">{{idx}} - {{ card.title }}</h3> -->
        <h3 class="card-title">{{ card.title }}</h3>
        <TheoryBadge :label="card.category"/>
        <TheoryBadge :difficulty="card.difficulty"/>
        <span class="card-hint">→</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-list {
  display: flex;
  flex-direction: column;
  gap: 0px;
  max-width: 800px;
  margin: 0 auto;
  color: #e0e0e0;
  /* min-height: 100vh; */
  padding: 20px;
}

.card {
  background: #1e1e1e;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #2a2a2a;
  padding: 0;
  height: 40px;
  display: flex;
  margin: 5px 0;
  align-items: center;
}

.card:hover {
  transform: translateY(-2px);
  background: #252525;
  border-color: #3a3a3a;
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
  gap: 15px;
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.card-hint {
  font-size: 1.2rem;
  color: #64b5f6;
  font-weight: 400;
  opacity: 0.9;
  flex-shrink: 0;
}

.card:focus-visible {
  outline: 2px solid #64b5f6;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .card-content {
    padding: 0 15px;
    gap: 10px;
  }
  
  .card-title {
    font-size: 1rem;
  }
}
</style>
