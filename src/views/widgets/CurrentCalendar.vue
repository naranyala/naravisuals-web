<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const currentDate = defineModel<Date>({ default: () => new Date() })

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const days = computed(() => {
  const start = new Date(year.value, month.value, 1).getDay()
  const length = new Date(year.value, month.value + 1, 0).getDate()
  return Array.from({ length }, (_, i) => i + 1).map(day => ({
    day,
    offset: day === 1 ? start : 0
  }))
})

const isToday = (day: number) => {
  const today = new Date()
  return day === today.getDate() && 
         month.value === today.getMonth() && 
         year.value === today.getFullYear()
}

const isSelected = (day: number) => {
  const today = new Date()
  return day === today.getDate() && 
         month.value === today.getMonth() && 
         year.value === today.getFullYear()
}

// Removed selectDay function - days are not selectable

const prev = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const next = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const goToToday = () => {
  currentDate.value = new Date()
}
</script>

<template>
  <div class="widget">
    <div class="header">
      <button @click="prev">‹</button>
      <span>{{ monthNames[month] }} {{ year }}</span>
      <button @click="next">›</button>
    </div>
    
    <div class="grid">
      <div class="day-label" v-for="d in ['S','M','T','W','T','F','S']" :key="d">{{ d }}</div>
      <template v-for="{ day, offset } in days" :key="day">
        <div v-if="offset" :style="{ gridColumn: `span ${offset}` }"></div>
        <div 
          :class="{ 
            'day-cell': true,
            'highlighted': isSelected(day)
          }"
        >
          {{ day }}
        </div>
      </template>
    </div>
    
    <div class="footer">
      <button @click="goToToday" class="today-btn">Today</button>
    </div>
  </div>
</template>

<style scoped>
.widget {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  width: fit-content;
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
  min-width: 100px;
  text-align: center;
}

.header button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  color: #999;
  transition: color 0.2s;
}

.header button:hover {
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 8px;
  height: 240px;
}

.day-label {
  text-align: center;
  font-size: 11px;
  color: #666;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell {
  background: transparent;
  color: #999;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell.highlighted {
  background: #fff;
  color: #000;
  font-weight: 600;
}

.footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: center;
}

.today-btn {
  background: #2a2a2a;
  border: 1px solid #444;
  color: #fff;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.today-btn:hover {
  background: #333;
  border-color: #555;
}
</style>
