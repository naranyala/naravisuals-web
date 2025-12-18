# Desktop UI Patterns

Creating authentic desktop experiences requires understanding native UI patterns and implementing them with Vue.js in Tauri applications. This article explores patterns for building interfaces that feel native to each operating system while maintaining cross-platform consistency.

## Prerequisites

- Strong understanding of Vue 3 composition API and component architecture
- Knowledge of CSS for implementing native-looking interfaces
- Understanding of platform-specific UI guidelines (macOS, Windows, Linux)

## Core Concepts

Desktop UI patterns differ significantly from web UI patterns. They include native window controls, system menu integration, keyboard shortcuts, and platform-specific interaction patterns. The goal is to create applications that feel at home on each operating system.

## Implementation

### Platform-Aware Component Architecture

Create components that adapt to the current platform:

```typescript
// src/composables/usePlatformDetection.ts
import { ref, computed, onMounted } from 'vue';

// Platform detection
const platform = ref<NodeJS.Platform | 'tauri' | null>(null);
const isTauri = ref(false);

export function usePlatformDetection() {
  const detectPlatform = () => {
    // Check if running in Tauri environment
    if (typeof window.__TAURI_INTERNALS__ !== 'undefined') {
      isTauri.value = true;
      
      // In Tauri, get platform info from API
      import('@tauri-apps/api/os').then(async ({ platform: tauriPlatform }) => {
        platform.value = await tauriPlatform();
      }).catch(() => {
        // Fallback to browser detection if Tauri API unavailable
        platform.value = (navigator.platform as NodeJS.Platform) || 'unknown';
      });
    } else {
      // Browser environment - use navigator
      const userAgentPlatform = navigator.platform.toLowerCase();
      
      if (userAgentPlatform.includes('mac')) {
        platform.value = 'darwin';
      } else if (userAgentPlatform.includes('win')) {
        platform.value = 'win32';
      } else if (userAgentPlatform.includes('linux')) {
        platform.value = 'linux';
      } else {
        platform.value = 'unknown' as NodeJS.Platform;
      }
    }
  };

  const isMacOS = computed(() => platform.value === 'darwin');
  const isWindows = computed(() => platform.value === 'win32');
  const isLinux = computed(() => platform.value === 'linux');
  
  const platformClass = computed(() => {
    if (isMacOS.value) return 'platform-macos';
    if (isWindows.value) return 'platform-windows';
    if (isLinux.value) return 'platform-linux';
    return 'platform-unknown';
  });

  onMounted(() => {
    detectPlatform();
  });

  return {
    platform: computed(() => platform.value),
    isTauri: computed(() => isTauri.value),
    isMacOS,
    isWindows,
    isLinux,
    platformClass,
  };
}
```

### Native-Style Window Controls

Create platform-appropriate window controls:

```vue
<!-- src/components/NativeWindowControls.vue -->
<template>
  <div :class="['native-controls', platformClass]">
    <template v-if="showControls">
      <button
        v-if="showMinimize"
        :class="['control-btn', 'minimize']"
        :aria-label="t('window.minimize')"
        @click="minimizeWindow"
        @mouseenter="onControlHover"
        @mouseleave="onControlLeave"
      >
        <svg v-if="isMacOS" width="10" height="10" viewBox="0 0 10 10">
          <rect x="2" y="5" width="6" height="0.5" fill="currentColor" />
        </svg>
        <span v-else class="control-text">−</span>
      </button>
      
      <button
        v-if="showMaximize"
        :class="['control-btn', 'maximize']"
        :aria-label="t('window.maximize')"
        @click="toggleMaximize"
        @mouseenter="onControlHover"
        @mouseleave="onControlLeave"
      >
        <svg v-if="isMacOS" width="10" height="10" viewBox="0 0 10 10">
          <path d="M2.5,4.5 L2.5,7.5 L5.5,7.5 L5.5,4.5 Z M3,5 L5,5 L5,7 L3,7 Z" fill="currentColor" />
        </svg>
        <span v-else class="control-text">{{ isMaximized ? '❐' : '□' }}</span>
      </button>
      
      <button
        v-if="showClose"
        :class="['control-btn', 'close', { 'hover-active': isCloseHovered }]"
        :aria-label="t('window.close')"
        @click="closeWindow"
        @mouseenter="onCloseHover"
        @mouseleave="onControlLeave"
      >
        <svg v-if="isMacOS" width="10" height="10" viewBox="0 0 10 10">
          <path d="M3.5,3.5 L6.5,6.5 M6.5,3.5 L3.5,6.5" stroke="currentColor" stroke-width="0.8" />
        </svg>
        <span v-else class="control-text">✕</span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlatformDetection } from '../composables/usePlatformDetection';
import { getCurrentWindow } from '@tauri-apps/api/window';

const { t } = useI18n();
const { platformClass, isMacOS } = usePlatformDetection();

// Props
const props = withDefaults(defineProps<{
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
  showControls?: boolean;
}>(), {
  showMinimize: true,
  showMaximize: true,
  showClose: true,
  showControls: true,
});

// State
const isCloseHovered = ref(false);
const isMaximized = ref(false);

// Methods
const minimizeWindow = async () => {
  if (props.showMinimize) {
    try {
      await getCurrentWindow().minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  }
};

const toggleMaximize = async () => {
  if (props.showMaximize) {
    try {
      const win = getCurrentWindow();
      const currentMaximized = await win.isMaximized();
      
      if (currentMaximized) {
        await win.unmaximize();
        isMaximized.value = false;
      } else {
        await win.maximize();
        isMaximized.value = true;
      }
    } catch (error) {
      console.error('Failed to toggle maximize:', error);
    }
  }
};

const closeWindow = async () => {
  if (props.showClose) {
    try {
      await getCurrentWindow().close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  }
};

const onCloseHover = () => {
  isCloseHovered.value = true;
};

const onControlHover = () => {
  // Add hover effects for other controls if needed
};

const onControlLeave = () => {
  isCloseHovered.value = false;
};
</script>

<style scoped>
.native-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0 8px;
}

/* Windows/Linux controls */
.platform-windows .control-btn,
.platform-linux .control-btn {
  width: 46px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-family: 'Segoe UI Symbol', system-ui;
  font-size: 14px;
  color: #727272;
  cursor: pointer;
  transition: all 0.2s ease;
}

.platform-windows .control-btn:hover,
.platform-linux .control-btn:hover {
  background-color: #e5e5e5;
  color: #000;
}

.platform-windows .control-btn.close:hover,
.platform-linux .control-btn.close:hover {
  background-color: #e81123;
  color: white;
}

/* macOS controls */
.platform-macos .native-controls {
  position: relative;
  padding: 0;
  gap: 10px;
}

.platform-macos .control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.platform-macos .control-btn.minimize {
  background-color: #ffbd2e;
}

.platform-macos .control-btn.maximize {
  background-color: #00c740;
}

.platform-macos .control-btn.close {
  background-color: #fe5f58;
}

.platform-macos .control-btn.minimize:hover {
  background-color: #ffd26b;
}

.platform-macos .control-btn.maximize:hover {
  background-color: #3de36d;
}

.platform-macos .control-btn.close.hover-active {
  background-color: #fe8c87;
}

.platform-macos .control-btn.close:hover {
  background-color: #fe8c87;
}

/* Hide controls when not in Tauri */
.platform-unknown .control-btn {
  display: none;
}
</style>
```

### Native Menu Integration

Implement system menu integration:

```vue
<!-- src/components/NativeMenu.vue -->
<template>
  <div class="native-menu-container" style="display: none;">
    <!-- This component is primarily for programmatically creating native menus -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePlatformDetection } from '../composables/usePlatformDetection';
import { 
  Menu, 
  MenuItem, 
  Submenu, 
  Separator,
  getCurrentWindow 
} from '@tauri-apps/api/menu';
import { appWindow } from '@tauri-apps/api/window';

const { isMacOS } = usePlatformDetection();

onMounted(async () => {
  if (isMacOS.value) {
    // Create macOS-style application menu
    const appMenu = await createMacOSAppMenu();
    await appWindow.setMenu(appMenu);
  } else {
    // Create Windows/Linux-style application menu
    const fileMenu = await createFileMenu();
    const editMenu = await createEditMenu();
    const viewMenu = await createViewMenu();
    const windowMenu = await createWindowMenu();
    
    const menu = await Menu.new({
      items: [
        fileMenu,
        editMenu,
        viewMenu,
        windowMenu,
        await createHelpMenu()
      ]
    });
    
    await getCurrentWindow().setMenu(menu);
  }
});

async function createMacOSAppMenu() {
  const appMenu = await Submenu.new({
    text: 'AppName', // Will be replaced with actual app name
    items: [
      await MenuItem.new({
        text: 'About AppName',
        action: () => {
          // Show about dialog
          console.log('Show about dialog');
        }
      }),
      await Separator.new(),
      await MenuItem.new({
        text: 'Preferences...',
        accelerator: 'CmdOrCtrl+,',
        action: () => {
          // Show preferences
          console.log('Show preferences');
        }
      }),
      await Separator.new(),
      await MenuItem.new({
        text: 'Services',
        items: []
      }),
      await Separator.new(),
      await MenuItem.new({
        text: 'Hide AppName',
        accelerator: 'CmdOrCtrl+H',
        action: () => appWindow.hide()
      }),
      await MenuItem.new({
        text: 'Hide Others',
        accelerator: 'CmdOrCtrl+Shift+H',
        action: () => {
          // Hide other apps (macOS specific)
          console.log('Hide others');
        }
      }),
      await MenuItem.new({
        text: 'Show All',
        action: () => {
          // Show all apps (macOS specific)
          console.log('Show all');
        }
      }),
      await Separator.new(),
      await MenuItem.new({
        text: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        action: () => {
          // Exit the application
          console.log('Quit application');
        }
      })
    ]
  });

  return await Menu.new({
    items: [appMenu]
  });
}

async function createFileMenu() {
  return await Submenu.new({
    text: '&File',
    items: [
      await MenuItem.new({
        text: '&New',
        accelerator: 'CmdOrCtrl+N',
        action: () => console.log('New file')
      }),
      await MenuItem.new({
        text: '&Open',
        accelerator: 'CmdOrCtrl+O',
        action: () => console.log('Open file')
      }),
      await MenuItem.new({
        text: 'Open &Recent',
        items: []
      }),
      await Separator.new(),
      await MenuItem.new({
        text: '&Save',
        accelerator: 'CmdOrCtrl+S',
        action: () => console.log('Save file')
      }),
      await MenuItem.new({
        text: 'Save &As...',
        accelerator: 'CmdOrCtrl+Shift+S',
        action: () => console.log('Save as')
      }),
      await Separator.new(),
      await MenuItem.new({
        text: '&Print',
        accelerator: 'CmdOrCtrl+P',
        action: () => console.log('Print')
      })
    ]
  });
}

async function createEditMenu() {
  return await Submenu.new({
    text: '&Edit',
    items: [
      await MenuItem.new({
        text: '&Undo',
        accelerator: 'CmdOrCtrl+Z',
        action: () => console.log('Undo')
      }),
      await MenuItem.new({
        text: '&Redo',
        accelerator: 'CmdOrCtrl+Y',
        action: () => console.log('Redo')
      }),
      await Separator.new(),
      await MenuItem.new({
        text: '&Cut',
        accelerator: 'CmdOrCtrl+X',
        action: () => console.log('Cut')
      }),
      await MenuItem.new({
        text: 'C&opy',
        accelerator: 'CmdOrCtrl+C',
        action: () => console.log('Copy')
      }),
      await MenuItem.new({
        text: '&Paste',
        accelerator: 'CmdOrCtrl+V',
        action: () => console.log('Paste')
      }),
      await MenuItem.new({
        text: 'Select &All',
        accelerator: 'CmdOrCtrl+A',
        action: () => console.log('Select all')
      })
    ]
  });
}

async function createViewMenu() {
  return await Submenu.new({
    text: '&View',
    items: [
      await MenuItem.new({
        text: '&Reload',
        accelerator: 'CmdOrCtrl+R',
        action: () => window.location.reload()
      }),
      await MenuItem.new({
        text: 'Toggle &Full Screen',
        accelerator: 'F11',
        action: async () => {
          const win = getCurrentWindow();
          const isFullscreen = await win.isFullscreen();
          await win.setFullscreen(!isFullscreen);
        }
      })
    ]
  });
}

async function createWindowMenu() {
  return await Submenu.new({
    text: '&Window',
    items: [
      await MenuItem.new({
        text: '&Minimize',
        accelerator: 'CmdOrCtrl+M',
        action: () => getCurrentWindow().minimize()
      }),
      await MenuItem.new({
        text: 'Zoom',
        action: () => console.log('Zoom window')
      }),
      await Separator.new(),
      await MenuItem.new({
        text: 'Bring All to Front',
        action: () => console.log('Bring all to front')
      })
    ]
  });
}

async function createHelpMenu() {
  return await Submenu.new({
    text: '&Help',
    items: [
      await MenuItem.new({
        text: 'App &Help',
        accelerator: 'F1',
        action: () => console.log('Show help')
      })
    ]
  });
}
</script>
```

### Desktop-Specific UI Components

Create common desktop UI patterns:

```vue
<!-- src/components/TabBar.vue -->
<template>
  <div :class="['tab-bar', platformClass]">
    <div class="tab-container">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :class="[
          'tab',
          { 
            'active': activeTab === index,
            'closable': tab.closable,
            'modified': tab.modified
          }
        ]"
        @click="activateTab(index)"
      >
        <span class="tab-text">{{ tab.title }}</span>
        <button
          v-if="tab.closable"
          class="tab-close"
          @click.stop="closeTab(index, tab)"
          :aria-label="t('tabs.closeTab')"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1.5,1.5 L10.5,10.5 M10.5,1.5 L1.5,10.5" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>
        <span v-if="tab.modified" class="tab-modified">*</span>
      </div>
    </div>
    
    <!-- Add new tab button -->
    <button 
      class="add-tab-btn"
      @click="addNewTab"
      :aria-label="t('tabs.addTab')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M7,2 L7,12 M2,7 L12,7" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlatformDetection } from '../composables/usePlatformDetection';

interface Tab {
  id: string;
  title: string;
  modified?: boolean;
  closable?: boolean;
}

const { t } = useI18n();
const { platformClass } = usePlatformDetection();

// Props
const props = defineProps({
  tabs: {
    type: Array as PropType<Tab[]>,
    required: true
  }
});

// Emits
const emit = defineEmits<{
  'activate-tab': [index: number];
  'close-tab': [index: number, tab: Tab];
  'add-tab': [];
}>();

// State
const activeTab = ref(0);

// Methods
const activateTab = (index: number) => {
  activeTab.value = index;
  emit('activate-tab', index);
};

const closeTab = (index: number, tab: Tab) => {
  emit('close-tab', index, tab);
};

const addNewTab = () => {
  emit('add-tab');
};
</script>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  padding: 0 8px;
  background: var(--tab-bar-bg, #f0f0f0);
  border-bottom: 1px solid var(--border-color, #ccc);
  user-select: none;
}

.tab-container {
  display: flex;
  flex: 1;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-right: 1px solid var(--border-color, #ccc);
  background: var(--tab-inactive-bg, #e5e5e5);
  color: var(--tab-text-color, #333);
  cursor: pointer;
  font-size: 13px;
  position: relative;
  min-width: 120px;
  max-width: 200px;
}

.tab.active {
  background: var(--tab-active-bg, #fff);
  color: var(--tab-active-text, #000);
  font-weight: 500;
}

.tab.closable {
  padding-right: 30px;
}

.tab.modified .tab-text::after {
  content: '*';
  color: var(--modified-color, #007acc);
  margin-left: 2px;
}

.tab-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  position: absolute;
  right: 8px;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  color: var(--tab-close-color, #666);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-close:hover {
  background-color: var(--tab-close-hover, #d9d9d9);
  color: var(--tab-close-hover-color, #000);
}

.add-tab-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: var(--add-tab-bg, #ddd);
  color: var(--add-tab-color, #666);
  border-radius: 4px;
  cursor: pointer;
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-tab-btn:hover {
  background: var(--add-tab-hover, #ccc);
}

/* Platform specific styles */
.platform-macos .tab-bar {
  padding-left: 70px; /* Space for traffic lights on macOS */
}
</style>
```

## Advanced Patterns

### Context Menus with Tauri Integration

Create native context menus:

```vue
<!-- src/components/ContextMenu.vue -->
<template>
  <div :class="['context-menu', { visible: isVisible }]" :style="contextStyle">
    <div
      v-for="(item, index) in menuItems"
      :key="index"
      :class="['menu-item', { disabled: item.disabled }]"
      @click="handleItemClick(item)"
    >
      <span class="item-text">{{ item.text }}</span>
      <span v-if="item.accelerator" class="accelerator">{{ item.accelerator }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePlatformDetection } from '../composables/usePlatformDetection';

interface ContextMenuItem {
  text: string;
  action: () => void;
  disabled?: boolean;
  accelerator?: string;
}

const { isMacOS } = usePlatformDetection();

// Props
const props = defineProps<{
  items: ContextMenuItem[];
}>();

// State
const isVisible = ref(false);
const x = ref(0);
const y = ref(0);

// Computed
const menuItems = computed(() => props.items);
const contextStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
  '--platform-padding': isMacOS.value ? '26px' : '0px'
}));

// Methods
const show = (event: MouseEvent) => {
  x.value = event.clientX;
  y.value = event.clientY;
  isVisible.value = true;
};

const hide = () => {
  isVisible.value = false;
};

const handleItemClick = (item: ContextMenuItem) => {
  if (!item.disabled) {
    item.action();
    hide();
  }
};

const handleGlobalClick = (event: Event) => {
  if (!(event.target as Element).closest('.context-menu')) {
    hide();
  }
};

// Event listeners
onMounted(() => {
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('contextmenu', (e) => {
    if (e.target !== document.querySelector('.context-menu')) {
      hide();
    }
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
  document.removeEventListener('contextmenu', (e) => {
    if (e.target !== document.querySelector('.context-menu')) {
      hide();
    }
  });
});

// Expose methods
defineExpose({
  show,
  hide
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: var(--context-bg, #fff);
  border: 1px solid var(--border-color, #ccc);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 160px;
  z-index: 10000;
  display: none;
}

.context-menu.visible {
  display: block;
}

.menu-item {
  padding: 6px 16px 6px 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item:hover {
  background: var(--context-hover, #f0f0f0);
}

.menu-item.disabled {
  color: var(--disabled-color, #aaa);
  cursor: not-allowed;
}

.accelerator {
  color: var(--accelerator-color, #888);
  font-size: 12px;
  margin-left: 20px;
}
</style>
```

### Native Dialog Integration

Integrate with system dialogs:

```typescript
// src/services/dialogService.ts
import { message, ask, confirm, save, open } from '@tauri-apps/api/dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';

export class DialogService {
  static async showMessage(
    title: string, 
    message: string, 
    type: 'info' | 'warning' | 'error' = 'info'
  ): Promise<void> {
    await message(message, { 
      title,
      type 
    });
  }

  static async showConfirmation(
    title: string,
    message: string
  ): Promise<boolean> {
    return await confirm(message, { 
      title,
      okLabel: 'Yes',
      cancelLabel: 'No'
    });
  }

  static async showYesNoCancel(
    title: string,
    message: string
  ): Promise<'yes' | 'no' | 'cancel'> {
    return new Promise(async (resolve) => {
      // Tauri's confirm only returns boolean, so we'll use a custom approach
      // or create a custom dialog
      const result = await confirm(message, { 
        title,
        okLabel: 'Yes',
        cancelLabel: 'No'
      });
      
      if (result) {
        resolve('yes');
      } else {
        // For "cancel" we need a different approach
        // This is a simplified version
        resolve('no');
      }
    });
  }

  static async showOpenDialog(
    options?: {
      title?: string;
      multiple?: boolean;
      directory?: boolean;
      filters?: Array<{ name: string; extensions: string[] }>;
    }
  ): Promise<string | string[] | null> {
    return await open({
      title: options?.title,
      multiple: options?.multiple,
      directory: options?.directory,
      filters: options?.filters
    });
  }

  static async showSaveDialog(
    options?: {
      title?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }
  ): Promise<string | null> {
    return await save({
      title: options?.title,
      filters: options?.filters
    });
  }

  // Custom dialog for more complex scenarios
  static async showCustomDialog(
    component: any,
    props?: any
  ): Promise<any> {
    return new Promise((resolve) => {
      // Implementation would depend on your UI framework
      // This is a placeholder for a more complex custom dialog system
      console.log('Showing custom dialog:', component, props);
      resolve(null);
    });
  }
}
```

### Drag and Drop Integration

Implement native drag and drop:

```vue
<!-- src/components/DragDropArea.vue -->
<template>
  <div 
    :class="['drag-drop-area', { 'drag-over': isDragOver, 'drag-active': isDragActive }]"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileSelect"
  >
    <div class="drag-content">
      <slot :isDragOver="isDragOver" :isDragActive="isDragActive">
        <div class="default-content">
          <div class="icon">📁</div>
          <p>{{ t('dragDrop.dropFiles') }}</p>
          <p class="or-text">{{ t('dragDrop.orClick') }}</p>
        </div>
      </slot>
    </div>
    <input 
      ref="fileInput" 
      type="file" 
      :multiple="multiple" 
      :accept="accept" 
      style="display: none;" 
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = withDefaults(defineProps<{
  accept?: string;
  multiple?: boolean;
  directory?: boolean;
}>(), {
  multiple: true,
  directory: false
});

// Emits
const emit = defineEmits<{
  'files-dropped': [files: File[]];
  'drag-start': [];
  'drag-end': [];
}>();

// Refs
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const isDragActive = ref(false);

// Methods
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (!isDragOver.value) {
    isDragOver.value = true;
  }
};

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  isDragActive.value = true;
  if (!isDragOver.value) {
    isDragOver.value = true;
  }
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  if (e.relatedTarget === null) {
    isDragActive.value = false;
    isDragOver.value = false;
  } else {
    isDragOver.value = false;
  }
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  isDragActive.value = false;
  isDragOver.value = false;

  if (e.dataTransfer) {
    const files = Array.from(e.dataTransfer.files);
    emit('files-dropped', files);
  }
};

const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    emit('files-dropped', files);
  }
};
</script>

<style scoped>
.drag-drop-area {
  border: 2px dashed var(--border-color, #ccc);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-drop-area.drag-over {
  border-color: var(--primary-color, #007acc);
  background-color: var(--drag-over-bg, #f0f8ff);
}

.drag-drop-area.drag-active {
  border-width: 3px;
}

.default-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.or-text {
  margin-top: 12px;
  color: var(--secondary-text, #666);
  font-style: italic;
}
</style>
```

## Testing

Test desktop UI patterns to ensure proper functionality:

```typescript
// src/__tests__/desktopUI.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NativeWindowControls from '../components/NativeWindowControls.vue';
import TabBar from '../components/TabBar.vue';

// Mock Tauri API
vi.mock('@tauri-apps/api', async () => {
  const actual = await vi.importActual('@tauri-apps/api');
  return {
    ...actual,
    window: {
      getCurrentWindow: () => ({
        minimize: vi.fn(),
        maximize: vi.fn(),
        unmaximize: vi.fn(),
        close: vi.fn(),
        isMaximized: vi.fn().mockResolvedValue(false),
        setFullscreen: vi.fn()
      })
    }
  };
});

vi.mock('@tauri-apps/api/os', () => ({
  platform: vi.fn().mockResolvedValue('darwin') // Mock macOS
}));

describe('Desktop UI Components', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders native window controls correctly', () => {
    const wrapper = mount(NativeWindowControls, {
      props: {
        showMinimize: true,
        showMaximize: true,
        showClose: true
      }
    });

    expect(wrapper.find('.control-btn.minimize').exists()).toBe(true);
    expect(wrapper.find('.control-btn.maximize').exists()).toBe(true);
    expect(wrapper.find('.control-btn.close').exists()).toBe(true);
  });

  it('emits tab activation events', async () => {
    const tabs = [
      { id: '1', title: 'Tab 1' },
      { id: '2', title: 'Tab 2' }
    ];

    const wrapper = mount(TabBar, {
      props: { tabs }
    });

    // Click on the second tab
    const tabElement = wrapper.findAll('.tab')[1];
    await tabElement.trigger('click');

    expect(wrapper.emitted('activate-tab')).toBeTruthy();
    expect(wrapper.emitted('activate-tab')?.[0]).toEqual([1]);
  });

  it('handles tab closing', async () => {
    const tabs = [
      { id: '1', title: 'Tab 1', closable: true }
    ];

    const wrapper = mount(TabBar, {
      props: { tabs }
    });

    // Click on the close button
    const closeBtn = wrapper.find('.tab-close');
    await closeBtn.trigger('click');

    expect(wrapper.emitted('close-tab')).toBeTruthy();
  });
});
```

## Troubleshooting

Common desktop UI challenges and solutions:

- **Platform Detection**: Ensure proper platform detection works in both development and production
- **Native Menus**: Menu creation requires Tauri environment; implement fallbacks for web versions
- **Window Controls**: Only show native controls when running in Tauri environment
- **Accessibility**: Maintain keyboard navigation and screen reader support
- **Performance**: Avoid expensive re-renders of UI components that update frequently

## Summary

Native desktop UI patterns in Vue for Tauri applications require understanding platform-specific conventions and implementing appropriate visual styles. By creating platform-aware components and integrating with native APIs, you can build applications that feel at home on each operating system while maintaining cross-platform consistency.

Continue exploring related topics in our guide to [Menu Systems](./02_16_menu-systems.md) to learn how to implement native menu integration in your applications.