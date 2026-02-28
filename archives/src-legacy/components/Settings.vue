<template>
  <div class="settings-container">
    <div class="settings-header">
      <h2 class="settings-title">Settings</h2>
      <p class="settings-subtitle">Customize your app experience</p>
    </div>
    
    <div class="settings-sections">
      <!-- Data Management -->
      <div class="settings-section">
        <h3 class="section-title">📊 Data Management</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Export All Notes</div>
              <div class="setting-description">Save all your notes as a JSON file to disk</div>
            </div>
            <button @click="exportNotes" class="action-button primary">
              Export
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Import Notes</div>
              <div class="setting-description">Import notes from a JSON file on disk</div>
            </div>
            <button @click="importNotes" class="action-button secondary">
              Import
            </button>
          </div>
          
          <div class="setting-item danger">
            <div class="setting-info">
              <div class="setting-label">Clear All Data</div>
              <div class="setting-description">Permanently delete all notes and data</div>
            </div>
            <button @click="clearAllData" class="action-button danger">
              Clear All
            </button>
          </div>
        </div>
      </div>
      
      <!-- Appearance -->
      <div class="settings-section">
        <h3 class="section-title">🎨 Appearance</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Theme</div>
              <div class="setting-description">Choose your preferred color scheme</div>
            </div>
            <select v-model="selectedTheme" @change="changeTheme" class="theme-select">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Calendar View</div>
              <div class="setting-description">Show week numbers in calendar</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="showWeekNumbers" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Notifications -->
      <div class="settings-section">
        <h3 class="section-title">🔔 Notifications</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Daily Reminders</div>
              <div class="setting-description">Get reminded to write notes daily</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="dailyReminders" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Reminder Time</div>
              <div class="setting-description">When to send daily reminders</div>
            </div>
            <input
              type="time"
              v-model="reminderTime"
              @change="saveSettings"
              class="time-input"
              :disabled="!dailyReminders"
            >
          </div>
        </div>
      </div>
      
      <!-- About -->
      <div class="settings-section">
        <h3 class="section-title">ℹ️ About</h3>
        <div class="settings-group">
          <div class="about-info">
            <div class="app-info">
              <h4>Calendar Notes App</h4>
              <p>Version 1.0.0</p>
              <p>Built with VLang and Vue.js</p>
            </div>
            <div class="storage-info">
              <p><strong>Total Notes:</strong> {{ totalNotes }}</p>
              <p><strong>Active Days:</strong> {{ activeDays }}</p>
              <p><strong>Storage Used:</strong> {{ storageSize }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { webuiIpc, IpcResponse } from '../services/webuiIpc';

interface Note {
  id: string;
  content: string;
  timestamp: number;
  dateKey: string;
}

const selectedTheme = ref('dark');
const showWeekNumbers = ref(false);
const dailyReminders = ref(false);
const reminderTime = ref('09:00');
const notesStorage = ref<Record<string, Note[]>>({});
const isExporting = ref(false);
const isImporting = ref(false);

const loadNotesFromStorage = () => {
  const stored = localStorage.getItem('calendar-notes');
  if (stored) {
    notesStorage.value = JSON.parse(stored);
  }
};

const loadSettings = () => {
  const settings = localStorage.getItem('app-settings');
  if (settings) {
    const parsed = JSON.parse(settings);
    selectedTheme.value = parsed.theme || 'dark';
    showWeekNumbers.value = parsed.showWeekNumbers || false;
    dailyReminders.value = parsed.dailyReminders || false;
    reminderTime.value = parsed.reminderTime || '09:00';
  }
};

const saveSettings = () => {
  const settings = {
    theme: selectedTheme.value,
    showWeekNumbers: showWeekNumbers.value,
    dailyReminders: dailyReminders.value,
    reminderTime: reminderTime.value
  };
  localStorage.setItem('app-settings', JSON.stringify(settings));
};

const changeTheme = () => {
  saveSettings();
  // Apply theme (you could implement theme switching logic here)
  document.documentElement.setAttribute('data-theme', selectedTheme.value);
};

const exportNotes = async () => {
  // Check if WebUI is available
  if (!webuiIpc.isWebuiAvailable()) {
    // Fallback to browser download
    const notesData = JSON.stringify(notesStorage.value, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(notesData);
    const exportFileDefaultName = `calendar-notes-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Notes exported to browser download.\n\nFor desktop app export: Run the VLang backend executable.');
    return;
  }

  isExporting.value = true;
  console.log('[Settings] Starting notes export...');

  try {
    const notesData = JSON.stringify(notesStorage.value, null, 2);
    const response = await webuiIpc.exportNotes(notesData);

    if (response.success) {
      console.log('[Settings] Export successful:', response.message);
      alert(`✅ Export Successful!\n\n${response.message}\n\nCheck the application directory for the exported file.`);
    } else {
      console.error('[Settings] Export failed:', response.message);
      alert(`❌ Export Failed\n\nError: ${response.message}\n\nError Code: ${response.errorCode}\n\nTip: ${webuiIpc.getErrorMessage(response.errorCode)}`);
    }
  } catch (error) {
    console.error('[Settings] Export error:', error);
    alert(`⚠️ Export Error\n\nAn unexpected error occurred during export.\nPlease check the console for details.`);
  } finally {
    isExporting.value = false;
  }
};

const importNotes = async () => {
  // Check if WebUI is available
  if (!webuiIpc.isWebuiAvailable()) {
    alert('📁 Desktop App Required\n\nFile import from disk is only available in the desktop application.\n\nTo use import:\n1. Run the VLang backend executable\n2. Go to Settings > Import Notes\n3. Ensure "calendar-notes-import.json" is in the app directory');
    return;
  }

  isImporting.value = true;
  console.log('[Settings] Starting notes import...');

  try {
    const response = await webuiIpc.importNotes();

    if (response.success) {
      console.log('[Settings] Import successful:', response.message);
      alert(`✅ Import Successful!\n\n${response.message}\n\nNote: The imported data will appear in the calendar view.`);
    } else {
      console.error('[Settings] Import failed:', response.message);
      alert(`❌ Import Failed\n\nError: ${response.message}\n\nError Code: ${response.errorCode}\n\nTip: ${webuiIpc.getErrorMessage(response.errorCode)}`);
    }
  } catch (error) {
    console.error('[Settings] Import error:', error);
    alert(`⚠️ Import Error\n\nAn unexpected error occurred during import.\nPlease check the console for details.`);
  } finally {
    isImporting.value = false;
  }
};

const clearAllData = () => {
  const confirmed = confirm('⚠️ Clear All Data?\n\nThis will permanently delete ALL your notes.\nThis action CANNOT be undone.\n\nAre you sure you want to continue?');

  if (!confirmed) {
    console.log('[Settings] Clear data cancelled by user');
    return;
  }

  // Double confirmation for safety
  const doubleConfirm = confirm('❗ Final Confirmation\n\nAre you absolutely sure you want to delete all notes?\n\nClick OK to delete everything, or Cancel to abort.');

  if (!doubleConfirm) {
    console.log('[Settings] Clear data double-confirmation cancelled');
    return;
  }

  // Clear data
  localStorage.removeItem('calendar-notes');
  localStorage.removeItem('app-settings');
  notesStorage.value = {};
  selectedTheme.value = 'dark';
  showWeekNumbers.value = false;
  dailyReminders.value = false;
  reminderTime.value = '09:00';

  console.log('[Settings] All data cleared successfully');
  alert('✅ All Data Cleared\n\nAll notes and settings have been deleted.\n\nThe page will now refresh to apply changes.');
  
  // Optionally reload to apply changes
  location.reload();
};

const ipcStatus = computed(() => {
  const status = webuiIpc.getStatus();
  return {
    available: status.available,
    timeout: status.config.timeout,
    maxRetries: status.config.maxRetries
  };
});

onMounted(() => {
  loadNotesFromStorage();
  loadSettings();
  console.log('[Settings] IPC Status:', ipcStatus.value);
  console.log('[Settings] WebUI Available:', webuiIpc.isWebuiAvailable());
});

const totalNotes = computed(() => {
  return Object.values(notesStorage.value).reduce((total, notes) => total + notes.length, 0);
});

const activeDays = computed(() => {
  return Object.keys(notesStorage.value).length;
});

const storageSize = computed(() => {
  const notesSize = JSON.stringify(notesStorage.value).length;
  const settingsSize = JSON.stringify(localStorage.getItem('app-settings')).length;
  const totalBytes = notesSize + settingsSize;

  if (totalBytes < 1024) return `${totalBytes} B`;
  if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
  return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
});
</script>

<style scoped>
.settings-container {
  padding: 1rem;
  width: 100%;
  max-width: none;
}

.settings-header {
  margin-bottom: 2rem;
  text-align: center;
}

.settings-title {
  color: #e4e6eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-subtitle {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: rgba(37, 44, 62, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  color: #e4e6eb;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(42, 51, 72, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(58, 66, 82, 0.2);
  transition: all 0.2s ease;
}

.setting-item:hover {
  border-color: rgba(88, 101, 242, 0.3);
  background: rgba(42, 51, 72, 0.8);
}

.setting-item.danger {
  border-color: rgba(220, 53, 69, 0.3);
}

.setting-item.danger:hover {
  border-color: rgba(220, 53, 69, 0.5);
  background: rgba(220, 53, 69, 0.1);
}

.setting-info {
  flex: 1;
}

.setting-label {
  color: #e4e6eb;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.setting-description {
  color: #9ca3af;
  font-size: 0.85rem;
  line-height: 1.4;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button.primary {
  background: #5865f2;
  color: white;
}

.action-button.primary:hover {
  background: #4752c4;
}

.action-button.secondary {
  background: rgba(88, 101, 242, 0.1);
  color: #5865f2;
  border: 1px solid rgba(88, 101, 242, 0.3);
}

.action-button.secondary:hover {
  background: rgba(88, 101, 242, 0.2);
}

.action-button.danger {
  background: #dc3545;
  color: white;
}

.action-button.danger:hover {
  background: #c82333;
}

.theme-select {
  background: rgba(37, 44, 62, 0.8);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 6px;
  color: #e4e6eb;
  padding: 0.5rem;
  font-size: 0.9rem;
  min-width: 120px;
}

.theme-select:focus {
  outline: none;
  border-color: #5865f2;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(58, 66, 82, 0.3);
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #5865f2;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.time-input {
  background: rgba(37, 44, 62, 0.8);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 6px;
  color: #e4e6eb;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.time-input:focus {
  outline: none;
  border-color: #5865f2;
}

.time-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.about-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.app-info h4 {
  color: #e4e6eb;
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
}

.app-info p {
  color: #9ca3af;
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.storage-info p {
  color: #e4e6eb;
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.storage-info strong {
  color: #5865f2;
}

/* Responsive design */
@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-button {
    align-self: flex-end;
  }
  
  .about-info {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .settings-sections {
    gap: 1.5rem;
  }
  
  .settings-section {
    padding: 1rem;
  }
  
  .settings-title {
    font-size: 1.5rem;
  }
  
  .settings-subtitle {
    font-size: 0.9rem;
  }
}
</style>