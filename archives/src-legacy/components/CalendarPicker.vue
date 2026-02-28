<template>
  <div class="calendar-notes-container">
    <!-- Left Panel: Calendar -->
    <div class="calendar-panel">
      <div class="calendar-wrapper">
        <div class="calendar-header">
          <button @click="previousMonth" class="nav-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div class="month-year-display">
            {{ currentMonthYear }}
          </div>
          <button @click="nextMonth" class="nav-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        <div class="calendar-grid">
          <div class="weekdays">
            <div v-for="day in weekdays" :key="day" class="weekday">
              {{ day }}
            </div>
          </div>
          <div class="days">
            <div
              v-for="(date, index) in calendarDates"
              :key="index"
              :class="['day', {
                'other-month': !isCurrentMonth(date),
                'today': isToday(date),
                'selected': isSelected(date),
                'has-notes': hasNotesForDate(date)
              }]"
              @click="selectDate(date)"
            >
              {{ date.getDate() }}
              <div v-if="hasNotesForDate(date)" class="note-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Notes -->
    <div class="notes-panel">
      <div class="notes-header">
        <div class="selected-date-display" v-if="selectedDate">
          <span class="date-icon">📅</span>
          <span class="date-text">{{ formattedDate }}</span>
        </div>
        <div class="empty-date" v-else>
          <span class="date-icon">📅</span>
          <span class="date-text">Select a date to start taking notes</span>
        </div>
      </div>

      <div class="notes-content" v-if="selectedDate">
        <div class="note-input-section">
          <div class="input-header">
            <h4>Add New Note</h4>
            <span class="char-count">{{ currentNote.length }}/500</span>
          </div>
          <div class="input-wrapper">
            <textarea
              v-model="currentNote"
              placeholder="What's on your mind for this day?"
              class="note-input"
              rows="4"
              maxlength="500"
            ></textarea>
            <button @click="saveNote" class="save-button" :disabled="!currentNote.trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save
            </button>
          </div>
        </div>

        <div class="saved-notes-section">
          <div class="notes-header-info">
            <h4>Notes ({{ savedNotes.length }})</h4>
            <button
              v-if="savedNotes.length > 0"
              @click="clearAllNotes"
              class="clear-all-button"
            >
              Clear All
            </button>
          </div>

          <div class="notes-list" v-if="savedNotes.length > 0">
            <div
              v-for="note in savedNotes"
              :key="note.id"
              class="note-item"
            >
              <div class="note-content">
                <p>{{ note.content }}</p>
                <div class="note-meta">
                  <span class="note-time">{{ formatNoteTime(note.timestamp) }}</span>
                  <div class="note-actions">
                    <button @click="deleteNote(note.id)" class="delete-button">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-notes" v-else>
            <div class="empty-icon">📝</div>
            <p>No notes yet for this date</p>
            <p class="empty-subtitle">Start by adding your first note above</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const selectedDate = ref<Date | null>(null);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const currentNote = ref('');
const savedNotes = ref<Note[]>([]);
const notesStorage = ref<Record<string, Note[]>>({});

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Note {
  id: string;
  content: string;
  timestamp: number;
  dateKey: string;
}

const currentMonthYear = computed(() => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[currentMonth.value]} ${currentYear.value}`;
});

const calendarDates = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const dates = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
});

const formattedDate = computed(() => {
  if (!selectedDate.value) return '';
  return selectedDate.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const isCurrentMonth = (date: Date) => {
  return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value;
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const isSelected = (date: Date) => {
  if (!selectedDate.value) return false;
  return date.getDate() === selectedDate.value.getDate() &&
         date.getMonth() === selectedDate.value.getMonth() &&
         date.getFullYear() === selectedDate.value.getFullYear();
};

const selectDate = (date: Date) => {
  selectedDate.value = new Date(date);
  loadNotesForDate(date);
};

// Check if date has notes
const hasNotesForDate = (date: Date) => {
  const dateKey = getDateKey(date);
  return notesStorage.value[dateKey] && notesStorage.value[dateKey].length > 0;
};

// Load saved notes from localStorage
const loadNotesFromStorage = () => {
  const stored = localStorage.getItem('calendar-notes');
  if (stored) {
    notesStorage.value = JSON.parse(stored);
  }
};

// Save notes to localStorage
const saveNotesToStorage = () => {
  localStorage.setItem('calendar-notes', JSON.stringify(notesStorage.value));
};

// Get date key for storage
const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Load notes for specific date
const loadNotesForDate = (date: Date) => {
  const dateKey = getDateKey(date);
  currentNote.value = '';
  savedNotes.value = notesStorage.value[dateKey] || [];
};

// Save current note
const saveNote = () => {
  if (!selectedDate.value || !currentNote.value.trim()) return;
  
  const dateKey = getDateKey(selectedDate.value);
  const newNote: Note = {
    id: Date.now().toString(),
    content: currentNote.value.trim(),
    timestamp: Date.now(),
    dateKey
  };
  
  if (!notesStorage.value[dateKey]) {
    notesStorage.value[dateKey] = [];
  }
  
  notesStorage.value[dateKey].unshift(newNote); // Add to beginning
  savedNotes.value.unshift(newNote);
  currentNote.value = ''; // Clear input
  saveNotesToStorage();
};

// Delete note
const deleteNote = (noteId: string) => {
  if (!selectedDate.value) return;
  
  const dateKey = getDateKey(selectedDate.value);
  notesStorage.value[dateKey] = notesStorage.value[dateKey].filter(note => note.id !== noteId);
  savedNotes.value = savedNotes.value.filter(note => note.id !== noteId);
  saveNotesToStorage();
};

// Clear all notes for current date
const clearAllNotes = () => {
  if (!selectedDate.value) return;
  
  const dateKey = getDateKey(selectedDate.value);
  delete notesStorage.value[dateKey];
  savedNotes.value = [];
  saveNotesToStorage();
};

// Format note time
const formatNoteTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
};

// Watch for selected date changes
watch(selectedDate, (newDate) => {
  if (newDate) {
    loadNotesForDate(newDate);
  } else {
    currentNote.value = '';
    savedNotes.value = [];
  }
});

// Initialize storage on component mount
loadNotesFromStorage();
</script>

<style scoped>
.calendar-notes-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 100%;
  height: 100%;
}

.calendar-panel {
  background: rgba(37, 44, 62, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
}

.calendar-wrapper {
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.nav-button {
  background: var(--accent-primary, #5865f2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background: var(--accent-primary, #4752c4);
}

.month-year-display {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #e4e6eb);
  text-align: center;
  flex: 1;
}

.calendar-grid {
  width: 100%;
  background: var(--bg-secondary, #252c3e);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--text-primary, #e4e6eb);
  padding: 0.5rem 0;
  text-transform: uppercase;
  opacity: 0.8;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary, #e4e6eb);
  transition: all 0.2s ease;
  position: relative;
}

.day:hover:not(.other-month) {
  background: var(--accent-secondary, rgba(88, 101, 242, 0.2));
}

.day.other-month {
  opacity: 0.3;
  cursor: default;
}

.day.today {
  background: var(--accent-primary, #5865f2);
  color: white;
  font-weight: 600;
}

.day.selected {
  background: var(--accent-primary, #5865f2);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(88, 101, 242, 0.4);
}

.day.has-notes {
  position: relative;
}

.note-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  border: 1px solid var(--bg-secondary, #252c3e);
}

.notes-panel {
  background: rgba(37, 44, 62, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.notes-header {
  margin-bottom: 1.5rem;
}

.selected-date-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(42, 51, 72, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(58, 66, 82, 0.2);
}

.date-icon {
  font-size: 1.2rem;
}

.date-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary, #e4e6eb);
}

.empty-date .date-text {
  color: #9ca3af;
  font-weight: 500;
}

.notes-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.note-input-section {
  background: rgba(42, 51, 72, 0.6);
  border: 1px solid rgba(58, 66, 82, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.input-header h4 {
  margin: 0;
  color: var(--text-primary, #e4e6eb);
  font-size: 1rem;
  font-weight: 600;
}

.char-count {
  font-size: 0.8rem;
  color: #9ca3af;
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.note-input {
  flex: 1;
  padding: 0.75rem;
  background: var(--bg-secondary, #252c3e);
  border: 1px solid var(--border-primary, #3a4252);
  border-radius: 6px;
  color: var(--text-primary, #e4e6eb);
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.4;
  resize: vertical;
  min-height: 80px;
}

.note-input:focus {
  outline: none;
  border-color: var(--accent-primary, #5865f2);
  box-shadow: 0 0 0 2px var(--accent-secondary, rgba(88, 101, 242, 0.2));
}

.note-input::placeholder {
  color: var(--text-tertiary, #9ca3af);
}

.save-button {
  background: var(--accent-primary, #5865f2);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.save-button:hover:not(:disabled) {
  background: var(--accent-primary, #4752c4);
}

.save-button:disabled {
  background: var(--accent-secondary, rgba(88, 101, 242, 0.3));
  cursor: not-allowed;
  opacity: 0.6;
}

.saved-notes-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.notes-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notes-header-info h4 {
  margin: 0;
  color: var(--text-primary, #e4e6eb);
  font-size: 1rem;
  font-weight: 600;
}

.clear-all-button {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-button:hover {
  background: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.5);
}

.notes-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.note-item {
  background: var(--bg-secondary, #252c3e);
  border: 1px solid var(--border-primary, #3a4252);
  border-radius: 6px;
  padding: 0.75rem;
  transition: all 0.2s ease;
}

.note-item:hover {
  border-color: var(--accent-secondary, rgba(88, 101, 242, 0.5));
}

.note-content p {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary, #e4e6eb);
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.note-time {
  color: var(--text-tertiary, #9ca3af);
}

.note-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-button {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.delete-button:hover {
  background: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.5);
}

.empty-notes {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-notes .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-notes p {
  color: var(--text-primary, #e4e6eb);
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.empty-notes p:last-child {
  color: #9ca3af;
  font-size: 0.85rem;
  margin: 0;
}

/* Scrollbar styling for notes list */
.notes-list::-webkit-scrollbar {
  width: 6px;
}

.notes-list::-webkit-scrollbar-track {
  background: var(--bg-tertiary, #2a3348);
  border-radius: 3px;
}

.notes-list::-webkit-scrollbar-thumb {
  background: var(--border-primary, #3a4252);
  border-radius: 3px;
}

.notes-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary, #9ca3af);
}

/* Responsive design */
@media (max-width: 768px) {
  .calendar-notes-container {
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  .calendar-panel, .notes-panel {
    width: 100%;
    padding: 1rem;
  }

  .notes-list {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .calendar-notes-container {
    gap: 1rem;
    padding: 0;
  }

  .calendar-panel, .notes-panel {
    padding: 0.75rem;
  }

  .input-wrapper {
    flex-direction: column;
    gap: 0.5rem;
  }

  .save-button {
    width: 100%;
    justify-content: center;
  }

  .notes-list {
    max-height: 250px;
  }
}
</style>