<template>
  <div class="calendar">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-button">
        ‹
      </button>
      
      <div class="current-month">
        {{ currentMonthYear }}
      </div>
      
      <button @click="nextMonth" class="nav-button">
        ›
      </button>
    </div>

    <!-- Week Days -->
    <div class="calendar-weekdays">
      <div
        v-for="day in weekDays"
        :key="day"
        class="weekday"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date.toString()"
        :class="[
          'calendar-day',
          {
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'selected': day.isSelected,
            'disabled': day.isDisabled
          }
        ]"
        @click="selectDate(day)"
      >
        <span class="day-number">{{ day.day }}</span>
        
        <!-- Event Indicators -->
        <div v-if="day.events && day.events.length > 0" class="day-events">
          <div
            v-for="event in day.events.slice(0, 3)"
            :key="event.id"
            :class="['event-dot', event.type]"
            :title="event.title"
          ></div>
          <span v-if="day.events.length > 3" class="more-events">
            +{{ day.events.length - 3 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Selected Date Display -->
    <div v-if="selectedDate" class="selected-date">
      Selected: {{ formatDate(selectedDate) }}
    </div>

    <!-- Quick Actions -->
    <div class="calendar-actions">
      <button @click="goToToday" class="action-button">
        Today
      </button>
      <button @click="clearSelection" class="action-button">
        Clear
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: null
  },
  events: {
    type: Array,
    default: () => []
  },
  minDate: {
    type: Date,
    default: null
  },
  maxDate: {
    type: Date,
    default: null
  },
  showEvents: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'date-select', 'event-click'])

const currentDate = ref(new Date())
const selectedDate = ref(props.modelValue)

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const startDay = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const days = []
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push(createDayObject(date, false))
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    days.push(createDayObject(date, true))
  }
  
  // Next month days
  const totalCells = 42 // 6 weeks
  const nextMonthDays = totalCells - days.length
  for (let i = 1; i <= nextMonthDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push(createDayObject(date, false))
  }
  
  return days
})

const createDayObject = (date, isCurrentMonth) => {
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const isSelected = selectedDate.value && date.toDateString() === selectedDate.value.toDateString()
  
  const isDisabled = 
    (props.minDate && date < props.minDate) ||
    (props.maxDate && date > props.maxDate)
  
  const dayEvents = props.events.filter(event => 
    event.date.toDateString() === date.toDateString()
  )
  
  return {
    date,
    day: date.getDate(),
    isCurrentMonth,
    isToday,
    isSelected,
    isDisabled,
    events: dayEvents
  }
}

const selectDate = (day) => {
  if (day.isDisabled) return
  
  selectedDate.value = day.date
  emit('update:modelValue', day.date)
  emit('date-select', day.date)
}

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const goToToday = () => {
  const today = new Date()
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectDate(createDayObject(today, true))
}

const clearSelection = () => {
  selectedDate.value = null
  emit('update:modelValue', null)
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Navigate to specific date
const goToDate = (date) => {
  currentDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
  selectDate(createDayObject(date, true))
}

onMounted(() => {
  if (props.modelValue) {
    goToDate(props.modelValue)
  }
})

defineExpose({
  goToDate,
  goToToday,
  clearSelection,
  previousMonth,
  nextMonth
})
</script>

<style scoped>
.calendar {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  max-width: 400px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.current-month {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.nav-button {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  padding: 8px 4px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover:not(.disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.calendar-day.other-month {
  color: #9ca3af;
}

.calendar-day.today {
  background: #eff6ff;
  border-color: #3b82f6;
}

.calendar-day.selected {
  background: #3b82f6;
  color: white;
}

.calendar-day.disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.calendar-day.disabled:hover {
  background: transparent;
  border-color: transparent;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: center;
  max-width: 100%;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-dot.meeting {
  background: #ef4444;
}

.event-dot.task {
  background: #f59e0b;
}

.event-dot.event {
  background: #10b981;
}

.more-events {
  font-size: 10px;
  color: #6b7280;
}

.selected-date {
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #374151;
}

.calendar-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.action-button {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}
</style>
