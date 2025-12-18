# Menu Systems

Implementing native menu systems in Tauri applications provides authentic desktop experiences that users expect. This article explores patterns for creating application, context, and custom menus that integrate seamlessly with each operating system.

## Prerequisites

- Understanding of Tauri's menu APIs
- Knowledge of Vue event handling and component architecture
- Familiarity with platform-specific menu conventions

## Core Concepts

Native menu systems in Tauri allow applications to provide system-integrated menus that match each platform's conventions. These include application menus (top-level menus on macOS, integrated into the title bar on Windows/Linux), context menus (right-click menus), and custom menu implementations.

## Implementation

### Application Menu System

Create a comprehensive application menu system:

```typescript
// src/services/menuService.ts
import { 
  Menu, 
  MenuItem, 
  Submenu, 
  Separator,
  getCurrentWindow 
} from '@tauri-apps/api/menu';
import { appWindow } from '@tauri-apps/api/window';
import { usePlatformDetection } from '../composables/usePlatformDetection';

interface MenuItemConfig {
  text: string;
  action?: () => void;
  accelerator?: string;
  submenu?: MenuItemConfig[];
  disabled?: boolean;
  type?: 'normal' | 'checkbox' | 'radio';
  checked?: boolean;
}

export class MenuService {
  private static instance: MenuService;
  
  static getInstance(): MenuService {
    if (!MenuService.instance) {
      MenuService.instance = new MenuService();
    }
    return MenuService.instance;
  }

  async createApplicationMenu(menuConfig: MenuItemConfig[]): Promise<void> {
    const { isMacOS } = usePlatformDetection();
    
    if (isMacOS.value) {
      await this.createMacOSMenu(menuConfig);
    } else {
      await this.createStandardMenu(menuConfig);
    }
  }

  private async createMacOSMenu(menuConfig: MenuItemConfig[]): Promise<void> {
    // Create the main application menu for macOS
    const appMenu = await this.createMacOSAppMenu();
    
    // Create additional menus
    const otherMenus = await Promise.all(
      menuConfig.map(config => this.createSubmenu(config))
    );
    
    // Combine all menus
    const menu = await Menu.new({
      items: [appMenu, ...otherMenus]
    });
    
    await appWindow.setMenu(menu);
  }

  private async createMacOSAppMenu() {
    return await Submenu.new({
      text: 'AppName', // Will be dynamically replaced
      items: [
        await MenuItem.new({
          text: 'About AppName',
          action: () => this.handleMenuAction('about')
        }),
        await Separator.new(),
        await MenuItem.new({
          text: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          action: () => this.handleMenuAction('preferences')
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
          action: () => this.handleMenuAction('hide-others')
        }),
        await MenuItem.new({
          text: 'Show All',
          action: () => this.handleMenuAction('show-all')
        }),
        await Separator.new(),
        await MenuItem.new({
          text: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          action: () => this.handleMenuAction('quit')
        })
      ]
    });
  }

  private async createStandardMenu(menuConfig: MenuItemConfig[]): Promise<void> {
    const menus = await Promise.all(
      menuConfig.map(config => this.createSubmenu(config))
    );
    
    const menu = await Menu.new({
      items: menus
    });
    
    await getCurrentWindow().setMenu(menu);
  }

  private async createSubmenu(config: MenuItemConfig): Promise<Submenu> {
    const menuItems = await this.createMenuItems(config.submenu || []);
    return await Submenu.new({
      text: config.text,
      items: menuItems
    });
  }

  private async createMenuItems(configs: MenuItemConfig[]) {
    const items = [];
    
    for (const config of configs) {
      if (config.submenu && config.submenu.length > 0) {
        // Create submenu
        const submenu = await this.createSubmenu(config);
        items.push(submenu);
      } else if (config.text === '---') {
        // Separator
        items.push(await Separator.new());
      } else {
        // Regular menu item
        const menuItem = await MenuItem.new({
          text: config.text,
          accelerator: config.accelerator,
          action: config.action || (() => this.handleMenuAction(config.text))
        });
        items.push(menuItem);
      }
    }
    
    return items;
  }

  private handleMenuAction(action: string): void {
    console.log(`Menu action triggered: ${action}`);
    // Emit event or call appropriate handler
    window.dispatchEvent(new CustomEvent('menu-action', { detail: { action } }));
  }
}
```

### Context Menu System

Implement dynamic context menus:

```vue
<!-- src/components/ContextMenu.vue -->
<template>
  <transition name="fade">
    <div 
      v-show="visible" 
      ref="contextMenuRef"
      :class="['context-menu', themeClass]"
      :style="menuStyle"
    >
      <div 
        v-for="(item, index) in menuItems" 
        :key="index"
        :class="[
          'menu-item', 
          { 
            'disabled': item.disabled, 
            'separator': item.separator,
            'submenu': item.submenu && item.submenu.length > 0
          }
        ]"
        @click="handleItemClick(item)"
      >
        <div v-if="!item.separator" class="menu-content">
          <span class="item-text">{{ item.text }}</span>
          <span v-if="item.accelerator" class="accelerator">{{ item.accelerator }}</span>
          <span v-if="item.submenu" class="submenu-indicator">▶</span>
        </div>
        <div v-else class="separator"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useTheme } from '../composables/useTheme';

interface ContextMenuItem {
  text?: string;
  action?: () => void;
  accelerator?: string;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

const { themeClass } = useTheme();

// Props
const props = defineProps<{
  items: ContextMenuItem[];
}>();

// State
const visible = ref(false);
const menuItems = ref<ContextMenuItem[]>([]);
const x = ref(0);
const y = ref(0);
const contextMenuRef = ref<HTMLElement | null>(null);

// Computed
const menuStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
}));

// Methods
const show = async (event: MouseEvent) => {
  x.value = event.clientX;
  y.value = event.clientY;
  menuItems.value = props.items;
  
  visible.value = true;
  
  // Wait for DOM update before positioning
  await nextTick();
  
  // Adjust position to prevent menu from going off-screen
  adjustMenuPosition();
};

const hide = () => {
  visible.value = false;
};

const adjustMenuPosition = () => {
  if (!contextMenuRef.value) return;
  
  const menuRect = contextMenuRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let adjustedX = x.value;
  let adjustedY = y.value;
  
  // Adjust horizontally if menu goes off right edge
  if (menuRect.right > viewportWidth) {
    adjustedX = viewportWidth - menuRect.width - 10;
  }
  
  // Adjust vertically if menu goes off bottom
  if (menuRect.bottom > viewportHeight) {
    adjustedY = viewportHeight - menuRect.height - 10;
  }
  
  // Ensure menu doesn't go off left or top
  adjustedX = Math.max(10, adjustedX);
  adjustedY = Math.max(10, adjustedY);
  
  if (adjustedX !== x.value) x.value = adjustedX;
  if (adjustedY !== y.value) y.value = adjustedY;
};

const handleItemClick = (item: ContextMenuItem) => {
  if (item.disabled || item.separator) return;
  
  if (item.action) {
    item.action();
  }
  
  hide();
};

const handleGlobalClick = (event: Event) => {
  if (contextMenuRef.value && !contextMenuRef.value.contains(event.target as Node)) {
    hide();
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    hide();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
  document.removeEventListener('keydown', handleKeyDown);
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
  min-width: 160px;
  background: var(--context-menu-bg, #fff);
  border: 1px solid var(--context-menu-border, #d0d0d0);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  padding: 4px 0;
  font-size: 13px;
}

.menu-item {
  padding: 6px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item:not(.separator):hover {
  background: var(--context-menu-hover, #f5f5f5);
}

.menu-item.disabled {
  color: var(--context-menu-disabled, #aaa);
  cursor: not-allowed;
}

.menu-content {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.item-text {
  flex: 1;
}

.accelerator {
  margin-left: 20px;
  color: var(--context-menu-accelerator, #888);
  font-size: 11px;
}

.submenu-indicator {
  margin-left: 10px;
  font-size: 10px;
}

.separator {
  height: 1px;
  background: var(--context-menu-border, #d0d0d0);
  margin: 4px 0;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
```

### Menu Provider Component

Create a provider component to manage menus globally:

```vue
<!-- src/components/MenuProvider.vue -->
<template>
  <div class="menu-provider">
    <slot />
    <ContextMenu 
      ref="contextMenuRef"
      :items="currentContextMenuItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import ContextMenu from './ContextMenu.vue';

// Refs
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);
const currentContextMenuItems = ref<any[]>([]);

// Methods to expose
const showContextMenu = (event: MouseEvent, items: any[]) => {
  currentContextMenuItems.value = items;
  contextMenuRef.value?.show(event);
};

const hideContextMenu = () => {
  contextMenuRef.value?.hide();
};

// Provide methods to child components
provide('showContextMenu', showContextMenu);
provide('hideContextMenu', hideContextMenu);

// Register global context menu handler
onMounted(() => {
  const handleContextMenu = (event: MouseEvent) => {
    // Check if we should show a custom context menu instead of default
    const target = event.target as HTMLElement;
    const customMenuTarget = target.closest('[data-context-menu]');
    
    if (customMenuTarget) {
      event.preventDefault();
      const menuType = customMenuTarget.getAttribute('data-context-menu');
      
      // Get menu items based on type
      let menuItems = [];
      switch (menuType) {
        case 'text':
          menuItems = getTextContextMenuItems();
          break;
        case 'image':
          menuItems = getImageContextMenuItems();
          break;
        case 'file':
          menuItems = getFileContextMenuItems();
          break;
        default:
          menuItems = getDefaultContextMenuItems();
      }
      
      showContextMenu(event, menuItems);
    }
  };
  
  document.addEventListener('contextmenu', handleContextMenu);
  
  // Cleanup
  onMounted(() => {
    document.removeEventListener('contextmenu', handleContextMenu);
  });
});

// Default context menu items
const getDefaultContextMenuItems = () => [
  { text: 'Copy', accelerator: 'CmdOrCtrl+C', action: () => document.execCommand('copy') },
  { text: 'Cut', accelerator: 'CmdOrCtrl+X', action: () => document.execCommand('cut') },
  { text: 'Paste', accelerator: 'CmdOrCtrl+V', action: () => document.execCommand('paste') },
  { separator: true },
  { text: 'Select All', accelerator: 'CmdOrCtrl+A', action: () => document.execCommand('selectAll') }
];

// Text-specific context menu items
const getTextContextMenuItems = () => [
  { text: 'Copy', accelerator: 'CmdOrCtrl+C', action: () => document.execCommand('copy') },
  { text: 'Cut', accelerator: 'CmdOrCtrl+X', action: () => document.execCommand('cut') },
  { text: 'Paste', accelerator: 'CmdOrCtrl+V', action: () => document.execCommand('paste') },
  { separator: true },
  { text: 'Select All', accelerator: 'CmdOrCtrl+A', action: () => document.execCommand('selectAll') },
  { separator: true },
  { text: 'Look Up Selection', action: () => console.log('Looking up selection') }
];

// Image-specific context menu items
const getImageContextMenuItems = () => [
  { text: 'Copy Image', action: () => console.log('Copying image') },
  { text: 'Copy Image Address', action: () => console.log('Copying image address') },
  { text: 'Save Image As...', action: () => console.log('Saving image') },
  { separator: true },
  { text: 'Open Image in New Tab', action: () => console.log('Opening image in new tab') }
];

// File-specific context menu items
const getFileContextMenuItems = () => [
  { text: 'Open', action: () => console.log('Opening file') },
  { text: 'Open With', action: () => console.log('Opening with...') },
  { separator: true },
  { text: 'Rename', action: () => console.log('Renaming file') },
  { text: 'Delete', action: () => console.log('Deleting file') },
  { separator: true },
  { text: 'Properties', action: () => console.log('Showing properties') }
];
</script>
```

### Dynamic Menu Builder

Create a system for building menus based on application state:

```typescript
// src/services/dynamicMenuBuilder.ts
import { MenuItemConfig } from './menuService';

export class DynamicMenuBuilder {
  static buildFileMenu(isDocumentOpen: boolean, hasUnsavedChanges: boolean): MenuItemConfig {
    return {
      text: '&File',
      submenu: [
        {
          text: '&New',
          accelerator: 'CmdOrCtrl+N',
          action: () => console.log('New document')
        },
        {
          text: '&Open',
          accelerator: 'CmdOrCtrl+O',
          action: () => console.log('Open document')
        },
        { 
          text: 'Open &Recent', 
          submenu: [] // Populate dynamically
        },
        { separator: true },
        {
          text: '&Save',
          accelerator: 'CmdOrCtrl+S',
          action: () => console.log('Save document'),
          disabled: !isDocumentOpen || !hasUnsavedChanges
        },
        {
          text: 'Save &As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          action: () => console.log('Save as'),
          disabled: !isDocumentOpen
        },
        {
          text: 'Save A&ll',
          action: () => console.log('Save all'),
          disabled: !isDocumentOpen
        },
        { separator: true },
        {
          text: 'Page Se&tup',
          action: () => console.log('Page setup'),
          disabled: !isDocumentOpen
        },
        {
          text: '&Print',
          accelerator: 'CmdOrCtrl+P',
          action: () => console.log('Print'),
          disabled: !isDocumentOpen
        }
      ]
    };
  }

  static buildEditMenu(canUndo: boolean, canRedo: boolean, hasSelection: boolean): MenuItemConfig {
    return {
      text: '&Edit',
      submenu: [
        {
          text: '&Undo',
          accelerator: 'CmdOrCtrl+Z',
          action: () => console.log('Undo'),
          disabled: !canUndo
        },
        {
          text: '&Redo',
          accelerator: 'CmdOrCtrl+Y',
          action: () => console.log('Redo'),
          disabled: !canRedo
        },
        { separator: true },
        {
          text: '&Cut',
          accelerator: 'CmdOrCtrl+X',
          action: () => document.execCommand('cut'),
          disabled: !hasSelection
        },
        {
          text: 'C&opy',
          accelerator: 'CmdOrCtrl+C',
          action: () => document.execCommand('copy'),
          disabled: !hasSelection
        },
        {
          text: '&Paste',
          accelerator: 'CmdOrCtrl+V',
          action: () => document.execCommand('paste')
        },
        {
          text: 'Paste &Special',
          action: () => console.log('Paste special')
        },
        { separator: true },
        {
          text: '&Find',
          accelerator: 'CmdOrCtrl+F',
          action: () => console.log('Find')
        },
        {
          text: 'Find &Next',
          accelerator: 'F3',
          action: () => console.log('Find next')
        },
        {
          text: 'Find &Previous',
          accelerator: 'Shift+F3',
          action: () => console.log('Find previous')
        },
        { separator: true },
        {
          text: 'Select &All',
          accelerator: 'CmdOrCtrl+A',
          action: () => document.execCommand('selectAll')
        }
      ]
    };
  }

  static buildViewMenu(currentZoom: number, isFullscreen: boolean): MenuItemConfig {
    return {
      text: '&View',
      submenu: [
        {
          text: '&Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          action: () => console.log('Zoom in')
        },
        {
          text: 'Zoom &Out',
          accelerator: 'CmdOrCtrl+-',
          action: () => console.log('Zoom out')
        },
        {
          text: 'Re&set Zoom',
          accelerator: 'CmdOrCtrl+0',
          action: () => console.log('Reset zoom')
        },
        { separator: true },
        {
          text: 'Toggle Full &Screen',
          accelerator: 'F11',
          action: () => console.log('Toggle fullscreen'),
          checked: isFullscreen,
          type: 'checkbox'
        },
        {
          text: 'Toggle Menu &Bar',
          action: () => console.log('Toggle menubar')
        },
        {
          text: 'Toggle &Ruler',
          action: () => console.log('Toggle ruler')
        }
      ]
    };
  }
}
```

## Advanced Patterns

### Menu State Management

Implement reactive menu state management:

```typescript
// src/stores/menuStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MenuService } from '../services/menuService';

export const useMenuStore = defineStore('menu', () => {
  // State
  const isDocumentOpen = ref(false);
  const hasUnsavedChanges = ref(false);
  const canUndo = ref(false);
  const canRedo = ref(false);
  const hasSelection = ref(false);
  const currentZoom = ref(100);
  const isFullscreen = ref(false);
  const recentFiles = ref<string[]>([]);
  const isMenuBuilt = ref(false);

  // Getters
  const canSave = computed(() => isDocumentOpen.value && hasUnsavedChanges.value);
  const canSaveAll = computed(() => isDocumentOpen.value);
  const canPrint = computed(() => isDocumentOpen.value);

  // Actions
  const updateDocumentState = (open: boolean, unsaved: boolean) => {
    isDocumentOpen.value = open;
    hasUnsavedChanges.value = unsaved;
    rebuildMenu();
  };

  const updateEditState = (undo: boolean, redo: boolean, selection: boolean) => {
    canUndo.value = undo;
    canRedo.value = redo;
    hasSelection.value = selection;
  };

  const updateZoom = (zoom: number) => {
    currentZoom.value = zoom;
    rebuildMenu();
  };

  const updateFullscreen = (fullscreen: boolean) => {
    isFullscreen.value = fullscreen;
  };

  const addRecentFile = (filePath: string) => {
    // Add to beginning of list, limit to 10 items
    recentFiles.value = [filePath, ...recentFiles.value.filter(f => f !== filePath)].slice(0, 10);
    rebuildMenu();
  };

  const rebuildMenu = async () => {
    if (!isMenuBuilt.value) return;

    try {
      const menuService = MenuService.getInstance();
      const menuConfig = buildMenuConfig();
      await menuService.createApplicationMenu(menuConfig);
    } catch (error) {
      console.error('Failed to rebuild menu:', error);
    }
  };

  const buildMenuConfig = () => {
    const { buildFileMenu, buildEditMenu, buildViewMenu } = DynamicMenuBuilder;
    
    const menuConfig = [
      buildFileMenu(isDocumentOpen.value, hasUnsavedChanges.value),
      buildEditMenu(canUndo.value, canRedo.value, hasSelection.value),
      buildViewMenu(currentZoom.value, isFullscreen.value),
      {
        text: '&Help',
        submenu: [
          { text: '&Help Topics', action: () => console.log('Help topics') },
          { separator: true },
          { text: '&About', action: () => console.log('About') }
        ]
      }
    ];

    return menuConfig;
  };

  const initializeMenu = async () => {
    const menuService = MenuService.getInstance();
    const menuConfig = buildMenuConfig();
    await menuService.createApplicationMenu(menuConfig);
    isMenuBuilt.value = true;
  };

  return {
    // State
    isDocumentOpen,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    hasSelection,
    currentZoom,
    isFullscreen,
    recentFiles,
    isMenuBuilt,

    // Getters
    canSave,
    canSaveAll,
    canPrint,

    // Actions
    updateDocumentState,
    updateEditState,
    updateZoom,
    updateFullscreen,
    addRecentFile,
    initializeMenu,
  };
});
</script>
```

### Keyboard Shortcut Management

Create a comprehensive keyboard shortcut system:

```typescript
// src/services/shortcutManager.ts
import { onMounted, onUnmounted } from 'vue';

export interface Shortcut {
  key: string;
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  action: () => void;
  description?: string;
  platform?: 'darwin' | 'win32' | 'linux';
}

export class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map();
  private listener: ((e: KeyboardEvent) => void) | null = null;

  static instance: ShortcutManager;
  
  static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager();
    }
    return ShortcutManager.instance;
  }

  registerShortcut(shortcut: Shortcut): void {
    const key = this.normalizeKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  unregisterShortcut(key: string, modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[]): void {
    const normalizedKey = this.normalizeKey({ key, modifiers });
    this.shortcuts.delete(normalizedKey);
  }

  private normalizeKey(shortcut: Partial<Shortcut>): string {
    const modifiers = (shortcut.modifiers || []).sort().join('+');
    return `${modifiers}${modifiers ? '+' : ''}${shortcut.key}`.toLowerCase();
  }

  private isMatchingEvent(event: KeyboardEvent, shortcut: Shortcut): boolean {
    // Check key
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase() && 
        event.code.toLowerCase() !== `key${shortcut.key}`.toLowerCase()) {
      return false;
    }

    // Check modifiers
    const needsCtrl = shortcut.modifiers?.includes('ctrl') || shortcut.modifiers?.includes('meta');
    const needsShift = shortcut.modifiers?.includes('shift');
    const needsAlt = shortcut.modifiers?.includes('alt');

    if (needsCtrl && !event.ctrlKey && !event.metaKey) return false;
    if (needsShift && !event.shiftKey) return false;
    if (needsAlt && !event.altKey) return false;

    // If shortcut needs a modifier but event doesn't have expected modifier, check if it's just a key press
    const hasAnyModifier = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
    const shortcutHasModifier = needsCtrl || needsShift || needsAlt;

    if (shortcutHasModifier && !hasAnyModifier) return false;

    return true;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Skip if focusing on input-like elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    for (const [_, shortcut] of this.shortcuts) {
      if (this.isMatchingEvent(e, shortcut)) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  };

  enableShortcuts(): void {
    if (!this.listener) {
      this.listener = this.handleKeyDown;
      document.addEventListener('keydown', this.listener, true);
    }
  }

  disableShortcuts(): void {
    if (this.listener) {
      document.removeEventListener('keydown', this.listener, true);
      this.listener = null;
    }
  }

  getAvailableShortcuts(): { key: string; description: string }[] {
    return Array.from(this.shortcuts.values())
      .filter(shortcut => shortcut.description)
      .map(shortcut => ({
        key: this.formatShortcut(shortcut),
        description: shortcut.description!
      }));
  }

  private formatShortcut(shortcut: Shortcut): string {
    const parts = [];
    
    if (shortcut.modifiers) {
      for (const mod of shortcut.modifiers) {
        switch (mod) {
          case 'ctrl': parts.push('Ctrl'); break;
          case 'shift': parts.push('Shift'); break;
          case 'alt': parts.push('Alt'); break;
          case 'meta': parts.push('Cmd'); break;
        }
      }
    }
    
    parts.push(shortcut.key.toUpperCase());
    return parts.join('+');
  }
}

// Vue composable for using shortcut manager
export function useShortcuts() {
  const manager = ShortcutManager.getInstance();

  onMounted(() => {
    manager.enableShortcuts();
  });

  onUnmounted(() => {
    manager.disableShortcuts();
  });

  return {
    registerShortcut: manager.registerShortcut.bind(manager),
    unregisterShortcut: manager.unregisterShortcut.bind(manager),
    getShortcuts: manager.getAvailableShortcuts.bind(manager),
  };
}
```

### Menu Customization System

Allow users to customize menu layouts:

```typescript
// src/services/menuCustomization.ts
import { reactive, watch } from 'vue';

export interface CustomMenuItem {
  id: string;
  text: string;
  action?: string; // Reference to a registered action
  visible: boolean;
  position: number;
  submenu?: CustomMenuItem[];
}

export interface MenuLayout {
  [menuId: string]: {
    name: string;
    items: CustomMenuItem[];
  };
}

class MenuCustomizationService {
  private static instance: MenuCustomizationService;
  
  static getInstance(): MenuCustomizationService {
    if (!MenuCustomizationService.instance) {
      MenuCustomizationService.instance = new MenuCustomizationService();
    }
    return MenuCustomizationService.instance;
  }

  layout = reactive<MenuLayout>({
    file: {
      name: 'File',
      items: [
        { id: 'new', text: 'New', action: 'file.new', visible: true, position: 1 },
        { id: 'open', text: 'Open', action: 'file.open', visible: true, position: 2 },
        { id: 'save', text: 'Save', action: 'file.save', visible: true, position: 3 },
        { id: 'save-as', text: 'Save As', action: 'file.saveAs', visible: true, position: 4 },
      ]
    },
    edit: {
      name: 'Edit', 
      items: [
        { id: 'undo', text: 'Undo', action: 'edit.undo', visible: true, position: 1 },
        { id: 'redo', text: 'Redo', action: 'edit.redo', visible: true, position: 2 },
      ]
    }
  });

  saveLayout(): void {
    try {
      localStorage.setItem('menuLayout', JSON.stringify(this.layout));
    } catch (error) {
      console.error('Failed to save menu layout:', error);
    }
  }

  loadLayout(): void {
    try {
      const savedLayout = localStorage.getItem('menuLayout');
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout);
        Object.assign(this.layout, parsed);
      }
    } catch (error) {
      console.error('Failed to load menu layout:', error);
    }
  }

  addItem(menuId: string, item: CustomMenuItem): void {
    if (!this.layout[menuId]) {
      this.layout[menuId] = { name: menuId, items: [] };
    }
    
    // Find the correct position to insert the item
    const insertIndex = this.layout[menuId].items.findIndex(i => i.position > item.position);
    if (insertIndex === -1) {
      this.layout[menuId].items.push(item);
    } else {
      this.layout[menuId].items.splice(insertIndex, 0, item);
    }
    
    this.saveLayout();
  }

  removeItem(menuId: string, itemId: string): void {
    if (this.layout[menuId]) {
      this.layout[menuId].items = this.layout[menuId].items.filter(i => i.id !== itemId);
      this.saveLayout();
    }
  }

  updateItemVisibility(menuId: string, itemId: string, visible: boolean): void {
    const item = this.layout[menuId]?.items.find(i => i.id === itemId);
    if (item) {
      item.visible = visible;
      this.saveLayout();
    }
  }

  resetToDefaults(): void {
    // Reset to default layout
    this.layout.file = {
      name: 'File',
      items: [
        { id: 'new', text: 'New', action: 'file.new', visible: true, position: 1 },
        { id: 'open', text: 'Open', action: 'file.open', visible: true, position: 2 },
        { id: 'save', text: 'Save', action: 'file.save', visible: true, position: 3 },
        { id: 'save-as', text: 'Save As', action: 'file.saveAs', visible: true, position: 4 },
      ]
    };
    
    this.saveLayout();
  }
}

// Initialize and load the layout
const customizationService = MenuCustomizationService.getInstance();
customizationService.loadLayout();

// Watch for changes and save automatically
watch(customizationService.layout, () => {
  customizationService.saveLayout();
}, { deep: true });

export { customizationService as menuCustomizationService };
```

## Testing

Test your menu systems for proper functionality:

```typescript
// src/__tests__/menuSystem.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ContextMenu from '../components/ContextMenu.vue';
import { MenuService } from '../services/menuService';

// Mock Tauri API
vi.mock('@tauri-apps/api', async () => {
  const actual = await vi.importActual('@tauri-apps/api');
  return {
    ...actual,
    menu: {
      Menu: {
        new: vi.fn(() => ({
          append: vi.fn(),
          popup: vi.fn()
        }))
      },
      MenuItem: {
        new: vi.fn(() => ({}))
      },
      Submenu: {
        new: vi.fn(() => ({}))
      },
      Separator: {
        new: vi.fn(() => ({}))
      }
    },
    window: {
      appWindow: {
        setMenu: vi.fn()
      },
      getCurrentWindow: () => ({
        setMenu: vi.fn()
      })
    }
  };
});

vi.mock('../composables/usePlatformDetection', () => ({
  usePlatformDetection: () => ({
    isMacOS: { value: false }
  })
}));

describe('Menu System', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('creates application menu correctly', async () => {
    const menuService = new MenuService();
    const menuConfig = [
      {
        text: 'File',
        submenu: [
          { text: 'New', action: () => console.log('New') }
        ]
      }
    ];
    
    // This would test the actual menu creation
    await expect(menuService.createApplicationMenu(menuConfig)).resolves.not.toThrow();
  });

  it('renders context menu with items', () => {
    const wrapper = mount(ContextMenu, {
      props: {
        items: [
          { text: 'Copy', action: () => {} },
          { text: 'Paste', action: () => {} }
        ]
      }
    });

    expect(wrapper.findAll('.menu-item')).toHaveLength(2);
    expect(wrapper.text()).toContain('Copy');
    expect(wrapper.text()).toContain('Paste');
  });

  it('handles context menu item clicks', async () => {
    const actionMock = vi.fn();
    const wrapper = mount(ContextMenu, {
      props: {
        items: [
          { text: 'Test Action', action: actionMock }
        ]
      }
    });

    const item = wrapper.find('.menu-item');
    await item.trigger('click');

    expect(actionMock).toHaveBeenCalled();
  });

  it('hides context menu on external click', async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        items: [{ text: 'Test', action: () => {} }]
      }
    });

    // Show the menu first
    await (wrapper.vm as any).show(new MouseEvent('contextmenu', { clientX: 100, clientY: 100 }));
    expect(wrapper.vm.visible).toBe(true);

    // Simulate click outside
    const externalEvent = new MouseEvent('click');
    Object.defineProperty(externalEvent, 'target', { value: document.body, writable: true });
    document.dispatchEvent(externalEvent);

    // Need to wait for event processing
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(wrapper.vm.visible).toBe(false);
  });
});
```

## Troubleshooting

Common menu system challenges and solutions:

- **Platform Differences**: Implement different menu structures for macOS vs. Windows/Linux
- **Memory Leaks**: Properly clean up event listeners and menu references
- **Performance**: Defer menu building until application is ready
- **Accessibility**: Ensure keyboard navigation works with custom menus
- **Dynamic Updates**: Rebuild menus efficiently when application state changes

## Summary

Implementing native menu systems in Tauri applications requires understanding platform-specific conventions while providing consistent user experience. By creating modular, reactive menu systems with proper keyboard shortcut integration, you can build professional desktop applications that feel native on each platform.

Continue exploring related topics in our guide to [Dialog Systems](./02_17_dialog-systems.md) to learn how to implement native dialog management in your applications.