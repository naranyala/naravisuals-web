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
  <div class="widget-container">
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
              'highlighted': isSelected(day),
              'today': isToday(day)
            }"
          >
            {{ day }}
          </div>
        </template>
        <!-- Empty cells to maintain 6-row grid -->
        <div 
          v-for="n in (42 - days.length - (days[0]?.offset || 0))" 
          :key="`empty-${n}`"
          class="day-cell empty"
        ></div>
      </div>
      
      <div class="footer">
        <button @click="goToToday" class="today-btn">Today</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.widget-container { 
  width: 100%; 
  /* max-width: 400px;  */
  max-width: 600px;
  margin: 0 auto; 
  padding: 16px auto;
  box-sizing: border-box;
}

.widget {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  margin: 0 auto;
  padding: 16px;
  /* width: 100%; */
  max-width: 500px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header span {
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  min-width: 100px;
  text-align: center;
}

.header button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 12px;
  color: #999;
  transition: color 0.2s;
  line-height: 1;
}

.header button:hover {
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr); /* Fixed 6 rows for 6 weeks */
  gap: 4px;
  width: 100%;
  aspect-ratio: 7/6; /* Maintain fixed aspect ratio */
}

.day-label {
  text-align: center;
  font-size: 12px;
  color: #666;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}

.day-cell {
  background: transparent;
  color: #999;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
}

.day-cell.empty {
  visibility: hidden; /* Hide empty cells but maintain grid structure */
}

.day-cell.highlighted {
  background: #fff;
  color: #000;
  font-weight: 600;
}

.day-cell.today {
  position: relative;
}

.day-cell.today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #4CAF50;
  border-radius: 50%;
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
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  max-width: 120px;
}

.today-btn:hover {
  background: #333;
  border-color: #555;
}

@media (min-width: 768px) {
  .widget-container {
    padding: 20px;
  }
  
  .header span {
    font-size: 18px;
  }
  
  .header button {
    font-size: 28px;
    padding: 6px 16px;
  }
  
  .day-label {
    font-size: 14px;
  }
  
  .day-cell {
    font-size: 16px;
    min-height: 44px;
  }
  
  .today-btn {
    font-size: 16px;
    padding: 10px 20px;
  }
}
</style>
