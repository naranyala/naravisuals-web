# Local Storage & Data Persistence in Vue for Tauri Applications

Managing data persistence in Tauri applications requires balancing between browser-based storage solutions and native file system operations. This article explores patterns for maintaining application state across sessions while leveraging the best of both web and native storage.

## Prerequisites

- Understanding of Vue's reactivity system
- Knowledge of Tauri's file system APIs
- Familiarity with browser storage APIs

## Core Concepts

Data persistence in Tauri applications can leverage both traditional web storage mechanisms (localStorage, IndexedDB) and native file system operations. The choice depends on data size, security requirements, and performance needs.

## Implementation

### Basic State Persistence with Browser Storage

Start with simple state persistence using browser storage APIs:

```typescript
// src/composables/usePersistentState.ts
import { ref, Ref, watch, onMounted } from 'vue';

export interface PersistentOptions {
  storageKey?: string;
  storageType?: 'localStorage' | 'sessionStorage';
  validate?: (value: any) => boolean;
}

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options: PersistentOptions = {}
): [Ref<T>, (value: T) => void] {
  const {
    storageKey = key,
    storageType = 'localStorage',
    validate = () => true
  } = options;

  const state = ref<T>(defaultValue);

  // Load initial state
  const loadState = () => {
    try {
      const storedValue = window[storageType].getItem(storageKey);
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);
        if (validate(parsedValue)) {
          state.value = parsedValue;
        } else {
          // Validation failed, reset to default
          window[storageType].removeItem(storageKey);
          state.value = defaultValue;
        }
      }
    } catch (error) {
      console.warn(`Failed to load state for key "${storageKey}":`, error);
      state.value = defaultValue;
    }
  };

  // Save state
  const saveState = (value: T) => {
    try {
      const serializedValue = JSON.stringify(value);
      window[storageType].setItem(storageKey, serializedValue);
    } catch (error) {
      console.error(`Failed to save state for key "${storageKey}":`, error);
    }
  };

  // Watch for changes and persist
  watch(state, (newValue) => {
    saveState(newValue);
  }, { deep: true });

  // Load initial state on component mount
  onMounted(loadState);

  return [state, (value: T) => { state.value = value; }];
}
```

### Advanced Persistent Store

Create a more sophisticated persistent store using Pinia:

```typescript
// src/stores/persistentStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: number;
  notifications: boolean;
  lastVisited: string;
}

export const usePersistentStore = defineStore('persistent', () => {
  // State with defaults
  const userPreferences = ref<UserPreferences>({
    theme: 'auto',
    language: 'en',
    fontSize: 16,
    notifications: true,
    lastVisited: new Date().toISOString(),
  });

  const lastSync = ref<string | null>(null);
  const isInitialized = ref(false);

  // Getters
  const getTheme = computed(() => userPreferences.value.theme);
  const getLanguage = computed(() => userPreferences.value.language);
  const getFontSize = computed(() => userPreferences.value.fontSize);

  // Actions
  const loadPreferences = async () => {
    try {
      // Try to load from file system first (for more secure/complex data)
      const fileData = await loadFromFileSystem();
      if (fileData) {
        userPreferences.value = { ...userPreferences.value, ...fileData };
      } else {
        // Fallback to localStorage
        const localStorageData = loadFromLocalStorage();
        if (localStorageData) {
          userPreferences.value = { ...userPreferences.value, ...localStorageData };
        }
      }

      isInitialized.value = true;
      lastSync.value = new Date().toISOString();
    } catch (error) {
      console.error('Failed to load preferences:', error);
      // Use defaults if loading fails
      isInitialized.value = true;
    }
  };

  const savePreferences = async (newPreferences?: Partial<UserPreferences>) => {
    if (newPreferences) {
      userPreferences.value = { ...userPreferences.value, ...newPreferences, lastVisited: new Date().toISOString() };
    } else {
      userPreferences.value.lastVisited = new Date().toISOString();
    }

    try {
      // Save to file system for more secure/complex data
      await saveToFileSystem(userPreferences.value);
      
      // Also save to localStorage as backup/fallback
      saveToLocalStorage(userPreferences.value);
      
      lastSync.value = new Date().toISOString();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Fallback to localStorage only
      saveToLocalStorage(userPreferences.value);
    }
  };

  const resetPreferences = async () => {
    const defaults: UserPreferences = {
      theme: 'auto',
      language: 'en',
      fontSize: 16,
      notifications: true,
      lastVisited: new Date().toISOString(),
    };
    
    userPreferences.value = defaults;
    await savePreferences();
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    await savePreferences(updates);
  };

  // Private helper functions
  const loadFromLocalStorage = (): Partial<UserPreferences> | null => {
    try {
      const stored = localStorage.getItem('userPreferences');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  };

  const saveToLocalStorage = (preferences: UserPreferences) => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  const loadFromFileSystem = async (): Promise<UserPreferences | null> => {
    try {
      // Use Tauri's file system API for secure storage
      const data = await invoke('get_user_data', { key: 'preferences' });
      return data as UserPreferences;
    } catch (error) {
      // File might not exist yet, which is fine
      return null;
    }
  };

  const saveToFileSystem = async (preferences: UserPreferences) => {
    try {
      await invoke('save_user_data', { 
        key: 'preferences', 
        data: JSON.stringify(preferences) 
      });
    } catch (error) {
      console.error('Failed to save to file system:', error);
      throw error;
    }
  };

  return {
    // State
    userPreferences,
    lastSync,
    isInitialized,

    // Getters
    getTheme,
    getLanguage,
    getFontSize,

    // Actions
    loadPreferences,
    savePreferences,
    resetPreferences,
    updatePreferences,
  };
});
```

### Tauri Backend for Secure Storage

Create Tauri commands for secure file-based storage:

```rust
// src/commands/storage.rs
use tauri::State;
use std::path::PathBuf;
use std::fs;
use serde_json::Value;
use crate::state::AppState;

#[tauri::command]
pub async fn get_user_data(
    state: State<'_, AppState>,
    key: String,
) -> Result<Option<Value>, String> {
    match get_app_data_dir(&state) {
        Ok(data_dir) => {
            let file_path = data_dir.join(format!("{}.json", key));
            
            if file_path.exists() {
                match fs::read_to_string(file_path) {
                    Ok(content) => {
                        match serde_json::from_str(&content) {
                            Ok(data) => Ok(Some(data)),
                            Err(e) => Err(format!("Failed to parse JSON: {}", e)),
                        }
                    }
                    Err(e) => Err(format!("Failed to read file: {}", e)),
                }
            } else {
                Ok(None) // File doesn't exist yet, which is fine
            }
        }
        Err(e) => Err(format!("Failed to get data directory: {}", e)),
    }
}

#[tauri::command]
pub async fn save_user_data(
    state: State<'_, AppState>,
    key: String,
    data: String,
) -> Result<(), String> {
    match get_app_data_dir(&state) {
        Ok(data_dir) => {
            // Ensure directory exists
            fs::create_dir_all(&data_dir)
                .map_err(|e| format!("Failed to create data directory: {}", e))?;
            
            let file_path = data_dir.join(format!("{}.json", key));
            
            // Write data to file
            fs::write(file_path, data)
                .map_err(|e| format!("Failed to write file: {}", e))?;
            
            Ok(())
        }
        Err(e) => Err(format!("Failed to get data directory: {}", e)),
    }
}

#[tauri::command]
pub async fn get_app_config_dir(state: State<'_, AppState>) -> Result<String, String> {
    match get_app_data_dir(&state) {
        Ok(data_dir) => {
            Ok(data_dir.to_string_lossy().to_string())
        }
        Err(e) => Err(format!("Failed to get config directory: {}", e)),
    }
}

#[tauri::command]
pub async fn clear_user_data(
    state: State<'_, AppState>,
    key: String,
) -> Result<(), String> {
    match get_app_data_dir(&state) {
        Ok(data_dir) => {
            let file_path = data_dir.join(format!("{}.json", key));
            
            if file_path.exists() {
                fs::remove_file(file_path)
                    .map_err(|e| format!("Failed to remove file: {}", e))?;
            }
            
            Ok(())
        }
        Err(e) => Err(format!("Failed to get data directory: {}", e)),
    }
}

fn get_app_data_dir(state: &AppState) -> Result<PathBuf, String> {
    let app_dir = state.app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;
    
    Ok(app_dir.join("user_data"))
}
```

### Session-Scoped Persistence

Implement temporary session persistence:

```typescript
// src/composables/useSessionStorage.ts
import { ref, Ref, watch } from 'vue';

export function useSessionStorage<T>(key: string, defaultValue: T): [Ref<T>, (value: T) => void] {
  const state = ref<T>(defaultValue);

  // Load from sessionStorage
  try {
    const storedValue = sessionStorage.getItem(key);
    if (storedValue) {
      state.value = JSON.parse(storedValue);
    }
  } catch (error) {
    console.warn(`Failed to load session state for key "${key}":`, error);
  }

  // Watch for changes and save to sessionStorage
  watch(state, (newValue) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Failed to save session state for key "${key}":`, error);
    }
  }, { deep: true });

  const setState = (value: T) => {
    state.value = value;
  };

  return [state, setState];
}
```

## Advanced Patterns

### Encrypted Storage

Implement encrypted storage for sensitive data:

```typescript
// src/services/encryptedStorage.ts
import { invoke } from '@tauri-apps/api';
import { Buffer } from 'buffer';

export class EncryptedStorage {
  static async setItem(key: string, value: any): Promise<void> {
    try {
      // Serialize the value
      const serializedValue = JSON.stringify(value);
      
      // Encrypt using Tauri's crypto capabilities
      const encryptedData = await invoke('encrypt_data', {
        data: serializedValue
      });
      
      // Store the encrypted data
      await invoke('save_secure_data', {
        key,
        encryptedData
      });
    } catch (error) {
      console.error('Failed to set encrypted item:', error);
      throw error;
    }
  }

  static async getItem(key: string): Promise<any> {
    try {
      // Retrieve the encrypted data
      const encryptedData = await invoke('get_secure_data', { key });
      
      if (!encryptedData) {
        return null;
      }
      
      // Decrypt using Tauri's crypto capabilities
      const decryptedData = await invoke('decrypt_data', {
        encryptedData
      });
      
      // Parse the decrypted value
      return JSON.parse(decryptedData as string);
    } catch (error) {
      console.error('Failed to get encrypted item:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await invoke('remove_secure_data', { key });
    } catch (error) {
      console.error('Failed to remove encrypted item:', error);
      throw error;
    }
  }
}
```

### Migration System

Create a system for handling storage schema migrations:

```typescript
// src/services/storageMigration.ts
import { reactive } from 'vue';

interface Migration {
  version: number;
  up: (oldData: any) => any;
}

class StorageMigrationService {
  private migrations: Migration[] = [
    {
      version: 1,
      up: (oldData: any) => {
        // Migration from no version to version 1
        return {
          ...oldData,
          version: 1,
          preferences: oldData.preferences || { theme: 'auto', language: 'en' }
        };
      }
    },
    {
      version: 2,
      up: (oldData: any) => {
        // Migration from version 1 to version 2
        return {
          ...oldData,
          version: 2,
          userSettings: {
            ...oldData.preferences,
            fontSize: oldData.preferences.fontSize || 16
          }
        };
      }
    },
    {
      version: 3,
      up: (oldData: any) => {
        // Migration from version 2 to version 3
        return {
          ...oldData,
          version: 3,
          profile: {
            name: oldData.userSettings?.name || '',
            email: oldData.userSettings?.email || ''
          },
          preferences: oldData.userSettings
            ? {
                theme: oldData.userSettings.theme,
                language: oldData.userSettings.language,
                fontSize: oldData.userSettings.fontSize,
                notifications: oldData.userSettings.notifications ?? true
              }
            : { theme: 'auto', language: 'en', fontSize: 16, notifications: true }
        };
      }
    }
  ];

  async migrateStorage(): Promise<void> {
    try {
      // Get current stored data
      const storedData = localStorage.getItem('appData');
      if (!storedData) {
        // No data to migrate
        this.setStorageVersion(3); // Set to latest version
        return;
      }

      let currentData;
      try {
        currentData = JSON.parse(storedData);
      } catch {
        // Invalid JSON, reset
        localStorage.setItem('appData', JSON.stringify({ version: 3 }));
        return;
      }

      const currentVersion = currentData.version || 0;
      const targetVersion = this.migrations.length;

      if (currentVersion >= targetVersion) {
        // Already at latest version
        return;
      }

      // Apply migrations
      let migratedData = currentData;
      for (const migration of this.migrations) {
        if (migration.version > currentVersion) {
          migratedData = migration.up(migratedData);
        }
      }

      // Save migrated data
      localStorage.setItem('appData', JSON.stringify(migratedData));
      console.log(`Storage migrated from version ${currentVersion} to ${targetVersion}`);
    } catch (error) {
      console.error('Migration failed:', error);
      // On failure, reset to default state
      localStorage.setItem('appData', JSON.stringify({ version: 3 }));
    }
  }

  private setStorageVersion(version: number): void {
    const currentData = JSON.parse(localStorage.getItem('appData') || '{}');
    localStorage.setItem('appData', JSON.stringify({ ...currentData, version }));
  }
}

// Initialize migration service
export const storageMigrationService = new StorageMigrationService();
```

### Backup and Restore System

Implement backup and restore functionality:

```typescript
// src/services/backupService.ts
import { invoke } from '@tauri-apps/api';
import { save, open } from '@tauri-apps/api/dialog';

export class BackupService {
  static async createBackup(): Promise<string | null> {
    try {
      // Gather all persistence data
      const backupData = {
        timestamp: new Date().toISOString(),
        localStorage: this.getLocalStorageData(),
        appData: await this.getAppData(),
      };

      // Create file dialog to save backup
      const selectedPath = await save({
        filters: [{
          name: 'Backup File',
          extensions: ['nvbackup']
        }]
      });

      if (!selectedPath) {
        return null; // User cancelled
      }

      // Write backup to file
      await invoke('write_backup_file', {
        path: selectedPath,
        data: JSON.stringify(backupData, null, 2)
      });

      return selectedPath;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  static async restoreBackup(): Promise<boolean> {
    try {
      // Open file dialog to select backup
      const selectedPath = await open({
        filters: [{
          name: 'Backup File',
          extensions: ['nvbackup']
        }],
        multiple: false
      });

      if (!selectedPath) {
        return false; // User cancelled
      }

      // Read backup file
      const backupContent = await invoke('read_backup_file', { path: selectedPath as string });
      const backupData = JSON.parse(backupContent as string);

      // Validate backup format
      if (!backupData || !backupData.localStorage || !backupData.appData) {
        throw new Error('Invalid backup file format');
      }

      // Restore local storage data
      this.setLocalStorageData(backupData.localStorage);

      // Restore app data
      await this.setAppData(backupData.appData);

      console.log('Backup restored successfully');
      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  private static getLocalStorageData(): Record<string, string> {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    return data;
  }

  private static setLocalStorageData(data: Record<string, string>): void {
    // Clear current storage
    localStorage.clear();
    
    // Restore data
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }

  private static async getAppData(): Promise<Record<string, any>> {
    try {
      // Get all app data files and their contents
      const appDataFiles = await invoke('list_app_data_files');
      const appData: Record<string, any> = {};
      
      for (const file of appDataFiles as string[]) {
        const content = await invoke('get_app_data_file', { file });
        if (content) {
          try {
            appData[file.replace('.json', '')] = JSON.parse(content as string);
          } catch {
            // If not JSON, store as string
            appData[file.replace('.json', '')] = content;
          }
        }
      }
      
      return appData;
    } catch (error) {
      console.error('Failed to get app data for backup:', error);
      return {};
    }
  }

  private static async setAppData(data: Record<string, any>): Promise<void> {
    // Clear existing app data
    await invoke('clear_all_app_data');
    
    // Write each data entry
    for (const [key, value] of Object.entries(data)) {
      await invoke('save_app_data_file', {
        file: `${key}.json`,
        content: JSON.stringify(value)
      });
    }
  }
}
```

## Testing

Test your persistence system to ensure reliability:

```typescript
// src/__tests__/persistence.test.ts
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { usePersistentStore } from '../stores/persistentStore';
import { createPinia, setActivePinia } from 'pinia';

// Mock Tauri API
vi.mock('@tauri-apps/api', async () => {
  const actual = await vi.importActual('@tauri-apps/api');
  return {
    ...actual,
    invoke: vi.fn((cmd: string, args: any) => {
      if (cmd === 'get_user_data' && args.key === 'preferences') {
        return Promise.resolve({
          theme: 'dark',
          language: 'es',
          fontSize: 18,
          notifications: false,
          lastVisited: '2023-01-01T00:00:00.000Z'
        });
      }
      if (cmd === 'save_user_data') {
        return Promise.resolve();
      }
      return Promise.resolve(null);
    })
  };
});

describe('Persistence System', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('loads preferences from storage', async () => {
    const store = usePersistentStore();
    await store.loadPreferences();
    
    expect(store.userPreferences.theme).toBe('dark');
    expect(store.userPreferences.language).toBe('es');
    expect(store.isInitialized).toBe(true);
  });

  it('saves preferences to storage', async () => {
    const store = usePersistentStore();
    await store.loadPreferences();
    
    await store.updatePreferences({ theme: 'light' });
    
    expect(store.userPreferences.theme).toBe('light');
    expect(store.lastSync).not.toBeNull();
  });

  it('resets preferences to defaults', async () => {
    const store = usePersistentStore();
    await store.loadPreferences();
    
    await store.resetPreferences();
    
    expect(store.userPreferences.theme).toBe('auto');
    expect(store.userPreferences.language).toBe('en');
  });

  it('handles localStorage persistence correctly', () => {
    const [state, setState] = usePersistentState('test-key', 'default-value');
    
    // Check initial value
    expect(state.value).toBe('default-value');
    
    // Update value
    setState('new-value');
    
    // Check that it's saved to localStorage
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
    
    // Create new instance and check it loads the saved value
    const [newState, _] = usePersistentState('test-key', 'another-default');
    expect(newState.value).toBe('new-value');
  });
});
```

## Troubleshooting

Common persistence challenges and solutions:

- **Storage Limits**: Be aware of browser storage limits (localStorage ~5-10MB)
- **Serialization Issues**: Ensure all stored data is JSON serializable
- **Cross-Platform Paths**: Use Tauri's path APIs for platform-appropriate storage locations
- **Security**: Sensitive data should use Tauri's file system APIs rather than browser storage
- **Performance**: Avoid storing large amounts of data in localStorage; prefer file system storage

## Summary

Effective data persistence in Tauri applications requires a hybrid approach that combines browser storage APIs with native file system operations. By using appropriate storage methods for different types of data and implementing proper migration strategies, you can create robust and reliable persistence systems that work across application sessions and updates.

Continue exploring related topics in our guide to [Desktop UI Patterns](./02_15_desktop-ui-patterns.md) to learn about user interface patterns specifically designed for desktop applications.