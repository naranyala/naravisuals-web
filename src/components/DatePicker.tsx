import { defineComponent, PropType, ref, computed, watch } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

interface DatePickerProps {
  modelValue: Date | null
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  placeholder?: string
  format?: string
  className?: string
}

const styles = {
  container: css`
    position: relative;
    width: 100%;
    max-width: 300px;
  `,

  input: css`
    width: 100%;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    &:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }
  `,

  calendarIcon: css`
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  `,

  calendar: css`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 50;
    margin-top: 0.25rem;
  `,

  calendarHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  `,

  calendarTitle: css`
    font-weight: 600;
    color: #374151;
  `,

  navButton: css`
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  `,

  calendarGrid: css`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #e5e7eb;
    padding: 1px;
  `,

  weekday: css`
    background: #f9fafb;
    padding: 0.5rem;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
  `,

  day: css`
    background: white;
    padding: 0.5rem;
    text-align: center;
    cursor: pointer;
    font-size: 0.875rem;

    &:hover:not(.disabled):not(.selected) {
      background: #f3f4f6;
    }

    &.selected {
      background: #3b82f6;
      color: white;
      font-weight: 500;
    }

    &.disabled {
      color: #d1d5db;
      cursor: not-allowed;
    }

    &.other-month {
      color: #9ca3af;
    }
  `,

  footer: css`
    padding: 0.75rem 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,

  todayButton: css`
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  `
}

export default defineComponent({
  name: 'DatePicker',

  props: {
    modelValue: {
      type: Date as PropType<Date | null>,
      default: null
    },
    minDate: Date,
    maxDate: Date,
    disabled: Boolean,
    placeholder: {
      type: String,
      default: 'Select date...'
    },
    format: {
      type: String,
      default: 'MM/dd/yyyy'
    },
    className: String
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const selectedDate = ref<Date | null>(props.modelValue)
    const currentMonth = ref(new Date())
    const showCalendar = ref(false)

    watch(() => props.modelValue, (newValue) => {
      selectedDate.value = newValue
    })

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString()
    }

    const monthName = computed(() => {
      return currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    })

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const calendarDays = computed(() => {
      const year = currentMonth.value.getFullYear()
      const month = currentMonth.value.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      const current = new Date(startDate)

      for (let i = 0; i < 42; i++) {
        days.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }

      return days
    })

    const isSameDay = (date1: Date, date2: Date): boolean => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    }

    const isDateDisabled = (date: Date): boolean => {
      if (props.minDate && date < props.minDate) return true
      if (props.maxDate && date > props.maxDate) return true
      return false
    }

    const selectDate = (date: Date) => {
      if (isDateDisabled(date)) return

      selectedDate.value = date
      showCalendar.value = false
      emit('update:modelValue', date)
    }

    const goToPreviousMonth = () => {
      currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1)
    }

    const goToNextMonth = () => {
      currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1)
    }

    const goToToday = () => {
      const today = new Date()
      currentMonth.value = today
      selectDate(today)
    }

    const toggleCalendar = () => {
      if (!props.disabled) {
        showCalendar.value = !showCalendar.value
      }
    }

    return () => (
      <div class={clsx(styles.container, props.className)}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            class={styles.input}
            value={selectedDate.value ? formatDate(selectedDate.value) : ''}
            placeholder={props.placeholder}
            disabled={props.disabled}
            readonly
            onClick={toggleCalendar}
          />
          <div class={styles.calendarIcon}>
            📅
          </div>
        </div>

        {showCalendar.value && (
          <div class={styles.calendar}>
            <div class={styles.calendarHeader}>
              <button class={styles.navButton} onClick={goToPreviousMonth}>
                ‹
              </button>
              <div class={styles.calendarTitle}>{monthName.value}</div>
              <button class={styles.navButton} onClick={goToNextMonth}>
                ›
              </button>
            </div>

            <div class={styles.calendarGrid}>
              {weekdays.map(day => (
                <div key={day} class={styles.weekday}>{day}</div>
              ))}
              {calendarDays.value.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonth.value.getMonth()
                const isSelected = selectedDate.value && isSameDay(day, selectedDate.value)
                const isDisabled = isDateDisabled(day)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={index}
                    class={clsx(
                      styles.day,
                      !isCurrentMonth && 'other-month',
                      isSelected && 'selected',
                      isDisabled && 'disabled'
                    )}
                    onClick={() => selectDate(day)}
                  >
                    {day.getDate()}
                  </div>
                )
              })}
            </div>

            <div class={styles.footer}>
              <button class={styles.todayButton} onClick={goToToday}>
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
})
