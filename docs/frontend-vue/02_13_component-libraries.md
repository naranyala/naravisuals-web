# Reusable Component Libraries in Vue for Tauri Applications

Creating reusable component libraries enhances maintainability and consistency across your Vue.js frontend in Tauri applications. This article explores patterns for building and organizing component libraries that work well with desktop applications.

## Prerequisites

- Solid understanding of Vue 3 composition API
- Knowledge of Tauri-Vue integration patterns
- Familiarity with build tools and packaging

## Core Concepts

Component libraries in desktop applications have unique requirements compared to web applications. They often need to incorporate native desktop UI patterns, handle system integration seamlessly, and maintain consistent user experiences across different operating systems.

## Implementation

### Creating a Basic Component Library Structure

Start by establishing the structure for your component library:

```
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.vue
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.vue
│   │   │   ├── Input.types.ts
│   │   │   └── index.ts
│   │   └── ...
│   └── desktop/
│       ├── NativeWindow/
│       │   ├── NativeWindow.vue
│       │   ├── NativeWindow.types.ts
│       │   └── index.ts
│       └── ...
├── composables/
│   ├── useNativeDialogs.ts
│   └── ...
└── styles/
    ├── variables.css
    └── mixins.css
```

### Building a Reusable Button Component

Create a flexible button component that supports different styles and behaviors:

```typescript
// src/components/ui/Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  href?: string; // For link-style buttons
  download?: string; // For download links
}

export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}
```

```vue
<!-- src/components/ui/Button/Button.vue -->
<template>
  <component
    :is="tag"
    :href="props.href"
    :download="props.download"
    :class="[
      'nv-button',
      `nv-button--${props.variant}`,
      `nv-button--${props.size}`,
      {
        'nv-button--disabled': props.disabled,
        'nv-button--loading': props.loading,
        'nv-button--icon-only': !!props.icon && !slots.default
      }
    ]"
    :disabled="props.disabled || props.loading"
    @click="handleClick"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <span class="nv-button__content">
      <span v-if="props.icon" class="nv-button__icon">
        <i :class="props.icon"></i>
      </span>
      <slot />
    </span>
    
    <span v-if="props.loading" class="nv-button__spinner">
      <!-- Loading spinner animation -->
      <svg viewBox="0 0 50 50" class="nv-spinner">
        <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { ButtonProps, ButtonEmits } from './Button.types';

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
});

const emit = defineEmits<ButtonEmits>();
const slots = useSlots();

const tag = computed(() => props.href ? 'a' : 'button');

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit('click', event);
};
</script>

<style scoped>
/* Base button styles */
.nv-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--border-radius-medium, 6px);
  font-family: inherit;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

/* Size variants */
.nv-button--small {
  padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
  font-size: var(--font-size-sm, 14px);
  min-height: 28px;
}

.nv-button--medium {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  font-size: var(--font-size-base, 16px);
  min-height: 36px;
}

.nv-button--large {
  padding: var(--spacing-md, 12px) var(--spacing-lg, 24px);
  font-size: var(--font-size-lg, 18px);
  min-height: 44px;
}

/* Variant colors */
.nv-button--primary {
  background-color: var(--color-primary, #1976d2);
  color: var(--color-on-primary, white);
}

.nv-button--primary:hover:not(.nv-button--disabled):not(.nv-button--loading) {
  background-color: var(--color-primary-hover, #1565c0);
}

.nv-button--secondary {
  background-color: var(--color-secondary, #757575);
  color: var(--color-on-secondary, white);
}

.nv-button--danger {
  background-color: var(--color-danger, #f44336);
  color: var(--color-on-danger, white);
}

.nv-button--outline {
  background-color: transparent;
  color: var(--color-primary, #1976d2);
  border: 2px solid var(--color-primary, #1976d2);
}

/* Disabled state */
.nv-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading state */
.nv-button--loading {
  pointer-events: none;
}

.nv-button__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
}

.nv-button__icon {
  display: flex;
}

.nv-button__spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: inherit;
}

.nv-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.nv-spinner circle {
  stroke: currentColor;
  stroke-linecap: round;
  animation: spin-stroke 1.5s ease-in-out infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes spin-stroke {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}
</style>
```

```typescript
// src/components/ui/Button/index.ts
import { App } from 'vue';
import Button from './Button.vue';

export { Button };

export default {
  install(app: App) {
    app.component('NvButton', Button);
  }
};
```

### Creating Desktop-Specific Components

Build components that integrate with native desktop features:

```typescript
// src/components/desktop/NativeWindow/NativeWindow.types.ts
export interface NativeWindowProps {
  title: string;
  width: number;
  height: number;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  center?: boolean;  // Center the window
}

export interface NativeWindowEmits {
  (e: 'close'): void;
  (e: 'resize', event: Event): void;
  (e: 'move', event: Event): void;
}
```

```vue
<!-- src/components/desktop/NativeWindow/NativeWindow.vue -->
<template>
  <div class="nv-native-window">
    <header v-if="showControls" class="nv-native-window__header">
      <div class="nv-native-window__controls">
        <button 
          v-if="minimizable" 
          class="nv-native-window__control nv-native-window__minimize"
          @click="minimizeWindow"
          aria-label="Minimize"
        >
          <i class="icon-minimize"></i>
        </button>
        <button 
          v-if="maximizable" 
          class="nv-native-window__control nv-native-window__maximize"
          @click="toggleMaximize"
          aria-label="Maximize"
        >
          <i class="icon-maximize"></i>
        </button>
        <button 
          v-if="closable" 
          class="nv-native-window__control nv-native-window__close"
          :class="{ 'nv-native-window__close--active': isHoveringClose }"
          @click="closeWindow"
          @mouseenter="isHoveringClose = true"
          @mouseleave="isHoveringClose = false"
          aria-label="Close"
        >
          <i class="icon-close"></i>
        </button>
      </div>
      <h1 class="nv-native-window__title">{{ props.title }}</h1>
    </header>
    
    <main class="nv-native-window__content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { NativeWindowProps, NativeWindowEmits } from './NativeWindow.types';
import { invoke } from '@tauri-apps/api';

const props = withDefaults(defineProps<NativeWindowProps>(), {
  resizable: true,
  maximizable: true,
  minimizable: true,
  closable: true,
  center: true
});

const emit = defineEmits<NativeWindowEmits>();

const isHoveringClose = ref(false);
const showControls = ref(true);

// Check if in Tauri environment
const isTauriEnvironment = () => typeof window.__TAURI_INTERNALS__ !== 'undefined';

const minimizeWindow = async () => {
  if (isTauriEnvironment()) {
    await invoke('plugin:window|minimize');
  }
};

const toggleMaximize = async () => {
  if (isTauriEnvironment()) {
    await invoke('plugin:window|toggle_maximize');
  }
};

const closeWindow = async () => {
  if (isTauriEnvironment()) {
    await invoke('plugin:window|close');
  }
  emit('close');
};

onMounted(() => {
  // Detect if we're running in Tauri to show/hide native controls
  showControls.value = isTauriEnvironment();
});

onUnmounted(() => {
  // Cleanup if needed
});
</script>

<style scoped>
.nv-native-window {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--window-background, #ffffff);
  color: var(--text-primary, #333333);
  border: 1px solid var(--border-color, #cccccc);
  border-radius: 8px;
  box-shadow: var(--window-shadow, 0 4px 20px rgba(0,0,0,0.15));
  overflow: hidden;
}

.nv-native-window__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--header-background, #f5f5f5);
  border-bottom: 1px solid var(--border-color, #dddddd);
  -webkit-app-region: drag; /* Enable window dragging */
  user-select: none; /* Prevent text selection in header */
  cursor: default; /* Show default cursor in draggable area */
}

.nv-native-window__controls {
  display: flex;
  gap: 8px;
}

.nv-native-window__control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--control-bg, #e0e0e0);
  color: var(--control-fg, #333);
  cursor: pointer;
  -webkit-app-region: no-drag; /* Disable drag on controls */
}

.nv-native-window__control:hover {
  background: var(--control-bg-hover, #d0d0d0);
}

.nv-native-window__close {
  background: #ff5f57;
  color: white;
}

.nv-native-window__close:hover {
  background: #e0443e;
}

.nv-native-window__close--active {
  background: #be3c34;
}

.nv-native-window__title {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  flex-grow: 1;
  text-align: center;
}

.nv-native-window__content {
  flex-grow: 1;
  padding: var(--content-padding, 20px);
  overflow: auto;
}

/* Icons */
.icon-minimize::before { content: "−"; font-size: 16px; }
.icon-maximize::before { content: "□"; font-size: 16px; }
.icon-close::before { content: "✕"; font-size: 16px; }
</style>
```

## Advanced Patterns

### Component Theming System

Create a theming system that works across all components:

```typescript
// src/composables/useTheme.ts
import { ref, computed } from 'vue';

export type Theme = 'light' | 'dark' | 'auto';

const currentTheme = ref<Theme>('auto');
const isDarkMode = ref(false);

export function useTheme() {
  const applyTheme = (theme: Theme) => {
    currentTheme.value = theme;
    
    // Determine if dark mode should be active
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = theme === 'dark' || (theme === 'auto' && prefersDark);
    
    // Apply theme class to document
    document.documentElement.classList.toggle('dark-theme', isDarkMode.value);
    document.documentElement.classList.toggle('light-theme', !isDarkMode.value);
  };
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      if (currentTheme.value === 'auto') {
        isDarkMode.value = e.matches;
        document.documentElement.classList.toggle('dark-theme', e.matches);
        document.documentElement.classList.toggle('light-theme', !e.matches);
      }
    });
  
  return {
    currentTheme,
    isDarkMode: computed(() => isDarkMode.value),
    applyTheme,
  };
}
```

### Component Registration Utility

Create a utility to register all components efficiently:

```typescript
// src/components/index.ts
import { App } from 'vue';
import Button from './ui/Button';
import Input from './ui/Input/Input.vue';
import NativeWindow from './desktop/NativeWindow/NativeWindow.vue';
// Import more components as needed

export {
  Button,
  Input,
  NativeWindow,
  // Export individual components
};

export default {
  install(app: App) {
    // Install component modules (those with install methods)
    app.use(Button);
    
    // Register individual components
    app.component('NvInput', Input);
    app.component('NvNativeWindow', NativeWindow);
    
    // Register more components as needed
  }
};
```

### Plugin Architecture for Components

Structure your library as a Vue plugin for easy installation:

```typescript
// src/lib/naravisuals-ui.ts
import { App } from 'vue';
import Components from '../components';
import '../styles/main.css'; // Global styles

// Define plugin options
interface NaravisualsUIOptions {
  prefix?: string; // Custom prefix for component names
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
}

const NaravisualsUI = {
  install(app: App, options: NaravisualsUIOptions = {}) {
    // Apply global configurations
    const prefix = options.prefix || 'nv';
    
    // Register all components with custom prefix
    app.use(Components, { prefix });
    
    // Apply theme if specified
    if (options.theme) {
      import('../composables/useTheme').then(({ useTheme }) => {
        const { applyTheme } = useTheme();
        applyTheme(options.theme as any);
      });
    }
  }
};

export default NaravisualsUI;

// Auto-install when used in browser environment
if (typeof window !== 'undefined' && (window as any).Vue) {
  (window as any).Vue.use(NaravisualsUI);
}
```

## Testing

Test your components to ensure they work correctly in different contexts:

```typescript
// src/components/ui/__tests__/Button.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Button from '../Button/Button.vue';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    });

    expect(wrapper.text()).toContain('Click me');
    expect(wrapper.classes()).toContain('nv-button--primary');
    expect(wrapper.classes()).toContain('nv-button--medium');
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('click');
  });

  it('disables the button when disabled prop is true', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Disabled' }
    });

    const button = wrapper.find('button');
    await button.trigger('click');
    expect(wrapper.emitted()).toBeUndefined(); // Should not emit click
  });
});
```

### Component Library Build Configuration

Configure your build process for the component library:

```javascript
// vite.config.lib.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: './src/lib/naravisuals-ui.ts',
      name: 'NaravisualsUI',
      fileName: (format) => `naravisuals-ui.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
```

## Troubleshooting

Common issues when building component libraries:

- **Tree Shaking**: Ensure proper module exports to enable tree shaking
- **CSS Isolation**: Use scoped styles or CSS modules to prevent style conflicts
- **Bundle Size**: Be mindful of dependencies and bundle size when creating libraries
- **Framework Compatibility**: Test across different Vue versions if needed
- **Type Definitions**: Ensure proper TypeScript definitions are generated
- **Accessibility**: Always consider accessibility when creating UI components

## Summary

Building reusable component libraries for Vue.js applications that integrate with Tauri requires careful consideration of desktop-specific UI patterns, theming, and system integration. By following modular architecture patterns and establishing clear interfaces, you can create maintainable and scalable component libraries that enhance the consistency and usability of your desktop applications.

Continue learning about related topics in our guide to [State Persistence](./02_14_state-persistence.md) to learn how to maintain component states across application sessions.