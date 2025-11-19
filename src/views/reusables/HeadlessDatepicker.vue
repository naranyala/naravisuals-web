<script setup lang="ts">
import { ref, computed } from 'vue'

const model = defineModel<Date | null>({ default: null })
const open = ref(false)

const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth())

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const days = computed(() => {
  const start = new Date(year.value, month.value, 1).getDay()
  const length = new Date(year.value, month.value + 1, 0).getDate()
  return Array.from({ length }, (_, i) => i + 1).map(day => ({
    day,
    offset: day === 1 ? start : 0
  }))
})

const isSelected = (day: number) => {
  if (!model.value) return false
  return day === model.value.getDate() && 
         month.value === model.value.getMonth() && 
         year.value === model.value.getFullYear()
}

const selectDay = (day: number) => {
  model.value = new Date(year.value, month.value, day)
  open.value = false
}

const prev = () => month.value === 0 ? (month.value = 11, year.value--) : month.value--
const next = () => month.value === 11 ? (month.value = 0, year.value++) : month.value++
</script>

<template>
  <div class="picker">
    <input 
      :value="model?.toLocaleDateString() || ''" 
      readonly 
      @click="open = !open" 
      placeholder="Select date"
    />
    
    <div v-if="open" class="popup" @click.stop>
      <div class="header">
        <button @click="prev">‹</button>
        <span>{{ monthNames[month] }} {{ year }}</span>
        <button @click="next">›</button>
      </div>
      
      <div class="grid">
        <div class="day-label" v-for="d in ['S','M','T','W','T','F','S']" :key="d">{{ d }}</div>
        <template v-for="{ day, offset } in days" :key="day">
          <div v-if="offset" :style="{ gridColumn: `span ${offset}` }"></div>
          <button 
            @click="selectDay(day)"
            :class="{ selected: isSelected(day) }"
          >
            {{ day }}
          </button>
        </template>
      </div>
    </div>
    
    <div v-if="open" class="backdrop" @click="open = false"></div>
  </div>
</template>

<style scoped>
.picker {
  position: relative;
  display: inline-block;
}

input {
  padding: 8px 12px;
  border: 1px solid #333;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: #1a1a1a;
  color: #fff;
  width: 160px;
}

input:hover {
  border-color: #555;
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
}

.popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  padding: 12px;
  z-index: 20;
  min-width: 240px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header span {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}

.header button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  color: #999;
}

.header button:hover {
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-label {
  text-align: center;
  font-size: 11px;
  color: #999;
  font-weight: 600;
  padding: 4px 0;
}

.grid button {
  aspect-ratio: 1;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
}

.grid button:hover {
  background: #2a2a2a;
}

.grid button.selected {
  background: #fff;
  color: #000;
}
</style>
