<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2 class="dashboard-title">Dashboard</h2>
      <p class="dashboard-subtitle">Welcome to your personal workspace</p>
    </div>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalNotes }}</div>
          <div class="stat-label">Total Notes</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-number">{{ activeDays }}</div>
          <div class="stat-label">Active Days</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-number">{{ averageNotesPerDay }}</div>
          <div class="stat-label">Avg Notes/Day</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-number">{{ todayNotes }}</div>
          <div class="stat-label">Today's Notes</div>
        </div>
      </div>
    </div>
    
    <div class="recent-activity">
      <h3>Recent Notes</h3>
      <div class="activity-list" v-if="recentNotes.length > 0">
        <div
          v-for="note in recentNotes.slice(0, 5)"
          :key="note.id"
          class="activity-item"
        >
          <div class="activity-date">{{ formatDateKey(note.dateKey) }}</div>
          <div class="activity-content">{{ truncateText(note.content, 100) }}</div>
          <div class="activity-time">{{ formatNoteTime(note.timestamp) }}</div>
        </div>
      </div>
      <div class="empty-activity" v-else>
        <div class="empty-icon">📋</div>
        <p>No notes yet</p>
        <p class="empty-subtitle">Start taking notes to see your activity here</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

interface Note {
  id: string;
  content: string;
  timestamp: number;
  dateKey: string;
}

const notesStorage = ref<Record<string, Note[]>>({});

const loadNotesFromStorage = () => {
  const stored = localStorage.getItem('calendar-notes');
  if (stored) {
    notesStorage.value = JSON.parse(stored);
  }
};

const totalNotes = computed(() => {
  return Object.values(notesStorage.value).reduce((total, notes) => total + notes.length, 0);
});

const activeDays = computed(() => {
  return Object.keys(notesStorage.value).length;
});

const averageNotesPerDay = computed(() => {
  const days = activeDays.value;
  return days > 0 ? (totalNotes.value / days).toFixed(1) : '0';
});

const todayNotes = computed(() => {
  const today = new Date();
  const dateKey = getDateKey(today);
  return notesStorage.value[dateKey]?.length || 0;
});

const recentNotes = computed(() => {
  const allNotes: Note[] = [];
  Object.values(notesStorage.value).forEach(notes => {
    allNotes.push(...notes);
  });
  return allNotes.sort((a, b) => b.timestamp - a.timestamp);
});

const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

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

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

onMounted(() => {
  loadNotesFromStorage();
});
</script>

<style scoped>
.dashboard-container {
  padding: 1rem;
  width: 100%;
  max-width: none;
}

.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-title {
  color: #e4e6eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(37, 44, 62, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(88, 101, 242, 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  color: #e4e6eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.stat-label {
  color: #9ca3af;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recent-activity {
  background: rgba(37, 44, 62, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
}

.recent-activity h3 {
  color: #e4e6eb;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  background: rgba(42, 51, 72, 0.6);
  border: 1px solid rgba(58, 66, 82, 0.2);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: rgba(88, 101, 242, 0.3);
  background: rgba(42, 51, 72, 0.8);
}

.activity-date {
  color: #5865f2;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.activity-content {
  color: #e4e6eb;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.activity-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.empty-activity {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-activity .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-activity p {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  color: #6b7280;
  font-size: 0.85rem;
  margin: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }
  
  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .dashboard-subtitle {
    font-size: 0.9rem;
  }
}
</style>