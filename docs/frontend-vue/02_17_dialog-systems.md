# Dialog Systems

Creating effective dialog systems is crucial for desktop applications. This article explores patterns for implementing modal dialogs, alerts, and confirmation dialogs that integrate with native desktop experiences while maintaining Vue's reactivity and component architecture.

## Prerequisites

- Understanding of Vue 3's Teleport and Suspense features
- Knowledge of Tauri's dialog APIs
- Familiarity with state management in Vue applications

## Core Concepts

Dialog systems in desktop applications must handle various interaction patterns including modal windows that block user interaction, system-level alerts, and custom content dialogs. The key is balancing native system integration with flexible Vue component architecture.

## Implementation

### Basic Dialog Service

Create a foundation for managing dialogs:

```typescript
// src/services/dialogService.ts
import { createApp, h, Teleport, ref, nextTick } from 'vue';
import { message, ask, confirm, save, open } from '@tauri-apps/api/dialog';
import ModalDialog from '../components/ModalDialog.vue';

interface DialogOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'info' | 'warning' | 'error' | 'question';
  persistent?: boolean; // Whether dialog can be dismissed by clicking outside
}

interface CustomDialogOptions extends DialogOptions {
  component?: any; // Vue component
  props?: any;
  slots?: Record<string, any>;
}

export class DialogService {
  private static instance: DialogService;
  private dialogContainer: HTMLElement | null = null;

  static getInstance(): DialogService {
    if (!DialogService.instance) {
      DialogService.instance = new DialogService();
    }
    return DialogService.instance;
  }

  constructor() {
    this.createContainer();
  }

  private createContainer(): void {
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.id = 'dialog-container';
    this.dialogContainer.style.position = 'fixed';
    this.dialogContainer.style.top = '0';
    this.dialogContainer.style.left = '0';
    this.dialogContainer.style.width = '100%';
    this.dialogContainer.style.height = '100%';
    this.dialogContainer.style.zIndex = '10000';
    document.body.appendChild(this.dialogContainer);
  }

  async showAlertDialog(options: DialogOptions): Promise<boolean> {
    const { title = 'Alert', message = '', type = 'info' } = options;
    
    // For system dialogs, use Tauri's API directly
    if (this.isSystemDialog(type)) {
      return await message(message, { 
        title,
        type: type as 'info' | 'warning' | 'error' 
      });
    }

    // For custom dialogs, use Vue component
    return new Promise((resolve) => {
      const wrapper = document.createElement('div');
      this.dialogContainer?.appendChild(wrapper);

      const handleResult = (result: boolean) => {
        // Clean up
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
        resolve(result);
      };

      // Mount custom alert component
      const app = createApp({
        render: () => h(ModalDialog, {
          title,
          message,
          confirmLabel: options.confirmLabel || 'OK',
          persistent: options.persistent !== true,
          onConfirm: () => handleResult(true),
          onCancel: () => handleResult(false)
        })
      });

      app.mount(wrapper);
    });
  }

  async showConfirmationDialog(options: DialogOptions): Promise<boolean> {
    const { title = 'Confirm', message = '', confirmLabel = 'OK', cancelLabel = 'Cancel' } = options;

    // Use Tauri's confirmation dialog for simple cases
    return await confirm(message, {
      title,
      okLabel: confirmLabel,
      cancelLabel
    });
  }

  async showCustomDialog(options: CustomDialogOptions): Promise<any> {
    const { 
      title = 'Dialog', 
      component, 
      props = {}, 
      slots = {},
      persistent = false 
    } = options;

    return new Promise((resolve) => {
      const wrapper = document.createElement('div');
      this.dialogContainer?.appendChild(wrapper);

      const handleResult = (result: any) => {
        // Clean up
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
        resolve(result);
      };

      // Mount custom dialog component
      const app = createApp({
        render: () => h(ModalDialog, {
          title,
          persistent,
          onConfirm: (result: any) => handleResult(result),
          onCancel: () => handleResult(null),
        }, () => [
          h(component, { ...props, onResult: handleResult })
        ])
      });

      app.mount(wrapper);
    });
  }

  private isSystemDialog(type: string): boolean {
    // System dialogs are native OS dialogs
    return ['info', 'warning', 'error'].includes(type);
  }
}

// Global dialog methods for easy access
export const showDialog = (options: DialogOptions) => {
  const service = DialogService.getInstance();
  return service.showAlertDialog(options);
};

export const showConfirmation = (options: DialogOptions) => {
  const service = DialogService.getInstance();
  return service.showConfirmationDialog(options);
};

export const showCustomDialog = (options: CustomDialogOptions) => {
  const service = DialogService.getInstance();
  return options.component 
    ? service.showCustomDialog(options)
    : service.showAlertDialog(options);
};
```

### Modal Dialog Component

Create a flexible modal dialog component:

```vue
<!-- src/components/ModalDialog.vue -->
<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div 
      ref="modalRef"
      :class="['modal-content', sizeClass]"
      @click.stop
      @keyup.esc="handleEscape"
      tabindex="-1"
    >
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button 
          v-if="showCloseButton"
          class="modal-close"
          @click="handleCancel"
          :aria-label="t('dialog.close')"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M4,4 L12,12 M12,4 L4,12" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <p v-if="message" class="modal-message">{{ message }}</p>
        <div class="modal-content-slot">
          <slot />
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button
          v-if="showCancelButton"
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
        >
          {{ cancelLabel }}
        </button>
        <button
          v-if="showConfirmButton"
          type="button"
          class="btn btn-primary"
          ref="confirmButton"
          @click="handleConfirm"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = withDefaults(defineProps<{
  title: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  persistent?: boolean;
  showCloseButton?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  initialFocus?: 'confirm' | 'cancel';
}>(), {
  size: 'md',
  persistent: false,
  showCloseButton: true,
  showCancelButton: true,
  showConfirmButton: true,
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  initialFocus: 'confirm',
});

// Emits
const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

// Refs
const modalRef = ref<HTMLElement | null>(null);
const confirmButton = ref<HTMLButtonElement | null>(null);

// Computed
const sizeClass = computed(() => `modal-${props.size}`);

// Methods
const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const handleOverlayClick = (e: MouseEvent) => {
  if (!props.persistent) {
    handleCancel();
  }
};

const handleEscape = () => {
  if (!props.persistent) {
    handleCancel();
  }
};

// Lifecycle
onMounted(async () => {
  // Focus the appropriate button
  await nextTick();
  
  if (props.initialFocus === 'confirm' && confirmButton.value) {
    confirmButton.value.focus();
  }
  
  // Trap focus within modal
  trapFocus();
});

onUnmounted(() => {
  // Cleanup focus trap if needed
});

const trapFocus = () => {
  // Implementation for focus trapping would go here
  // This is a simplified version
  if (modalRef.value) {
    modalRef.value.focus();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: var(--modal-bg, #fff);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  outline: none;
}

/* Size variants */
.modal-sm {
  width: 400px;
  max-width: 90%;
}

.modal-md {
  width: 600px;
  max-width: 90%;
}

.modal-lg {
  width: 800px;
  max-width: 90%;
}

.modal-xl {
  width: 1000px;
  max-width: 90%;
  height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 12px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary, #666);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--hover-bg, #f5f5f5);
  color: var(--text-primary, #333);
}

.modal-body {
  padding: 20px 24px;
  flex: 1;
  overflow-y: auto;
}

.modal-message {
  margin: 0 0 16px 0;
  color: var(--text-primary, #333);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid var(--border-color, #eee);
}

.btn {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color, #007acc);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover, #005a9e);
}

.btn-secondary {
  background: var(--secondary-bg, #f5f5f5);
  color: var(--text-primary, #333);
  border-color: var(--border-color, #ccc);
}

.btn-secondary:hover {
  background: var(--secondary-hover, #e5e5e5);
}
</style>
```

### Dialog Store

Create a centralized dialog store for managing dialog state:

```typescript
// src/stores/dialogStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DialogService } from '../services/dialogService';

export interface DialogItem {
  id: string;
  type: 'alert' | 'confirm' | 'prompt' | 'custom';
  title: string;
  message?: string;
  component?: any;
  props?: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  options?: any;
}

export const useDialogStore = defineStore('dialog', () => {
  const dialogs = ref<DialogItem[]>([]);
  const queue = ref<DialogItem[]>([]);

  // Getters
  const currentDialog = computed(() => dialogs.value[0] || null);
  const hasDialog = computed(() => dialogs.value.length > 0);
  const dialogCount = computed(() => dialogs.value.length);

  // Actions
  const show = (item: Omit<DialogItem, 'id' | 'resolve' | 'reject'>): Promise<any> => {
    return new Promise((resolve, reject) => {
      const dialogItem: DialogItem = {
        ...item,
        id: generateId(),
        resolve,
        reject
      };

      if (hasDialog.value) {
        // If there's already a dialog, queue this one
        queue.value.push(dialogItem);
      } else {
        // Show immediately
        dialogs.value.push(dialogItem);
      }
    });
  };

  const hideCurrent = (result?: any) => {
    if (dialogs.value.length > 0) {
      const current = dialogs.value.shift();
      if (current) {
        current.resolve(result);
      }
    }

    // Show next dialog in queue if available
    if (queue.value.length > 0 && !hasDialog.value) {
      const next = queue.value.shift();
      if (next) {
        dialogs.value.push(next);
      }
    }
  };

  const hideAll = () => {
    // Resolve all pending dialogs with false/cancel
    [...dialogs.value, ...queue.value].forEach(dialog => {
      dialog.resolve(false);
    });
    
    dialogs.value = [];
    queue.value = [];
  };

  const showDialog = async (options: any) => {
    const service = DialogService.getInstance();
    
    if (options.component) {
      return service.showCustomDialog(options);
    } else {
      // Use appropriate dialog method based on type
      switch (options.type) {
        case 'confirm':
          return service.showConfirmationDialog({
            title: options.title,
            message: options.message,
            confirmLabel: options.confirmLabel,
            cancelLabel: options.cancelLabel
          });
        default:
          return service.showAlertDialog({
            title: options.title,
            message: options.message
          });
      }
    }
  };

  const confirm = async (message: string, title = 'Confirm'): Promise<boolean> => {
    return new Promise((resolve) => {
      showDialog({
        type: 'confirm',
        title,
        message,
        confirmLabel: 'Yes',
        cancelLabel: 'No'
      }).then(resolve);
    });
  };

  const alert = async (message: string, title = 'Alert'): Promise<void> => {
    await showDialog({
      type: 'alert',
      title,
      message
    });
  };

  const prompt = async (message: string, title = 'Input', defaultValue = ''): Promise<string | null> => {
    // This would use a custom component for input
    return new Promise((resolve) => {
      // Implementation would show a dialog with input field
      resolve(defaultValue);
    });
  };

  // Helper functions
  const generateId = () => `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    // State
    dialogs,
    queue,
    
    // Getters
    currentDialog,
    hasDialog,
    dialogCount,
    
    // Actions
    show,
    hideCurrent,
    hideAll,
    showDialog,
    confirm,
    alert,
    prompt
  };
});
</script>
```

### Prebuilt Dialog Components

Create specialized dialog components for common patterns:

```vue
<!-- src/components/ConfirmationDialog.vue -->
<template>
  <ModalDialog
    :title="title"
    :message="message"
    :confirm-label="confirmLabel"
    :cancel-label="cancelLabel"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { useDialogStore } from '../stores/dialogStore';

const props = withDefaults(defineProps<{
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}>(), {
  title: 'Confirm',
  confirmLabel: 'Yes',
  cancelLabel: 'No'
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const dialogStore = useDialogStore();

const handleConfirm = () => {
  dialogStore.hideCurrent(true);
  emit('confirm');
};

const handleCancel = () => {
  dialogStore.hideCurrent(false);
  emit('cancel');
};
</script>
```

```vue
<!-- src/components/AlertDialog.vue -->
<template>
  <ModalDialog
    :title="title"
    :message="message"
    :show-cancel-button="false"
    confirm-label="OK"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { useDialogStore } from '../stores/dialogStore';

const props = withDefaults(defineProps<{
  title?: string;
  message: string;
}>(), {
  title: 'Alert'
});

const emit = defineEmits<{
  confirm: [];
}>();

const dialogStore = useDialogStore();

const handleConfirm = () => {
  dialogStore.hideCurrent();
  emit('confirm');
};
</script>
```

## Advanced Patterns

### Dialog Composition API

Create a composable for dialog management:

```typescript
// src/composables/useDialog.ts
import { useDialogStore } from '../stores/dialogStore';
import { storeToRefs } from 'pinia';

export function useDialog() {
  const dialogStore = useDialogStore();
  const { hasDialog, currentDialog, dialogCount } = storeToRefs(dialogStore);

  const showConfirmation = async (message: string, title = 'Confirm') => {
    return await dialogStore.confirm(message, title);
  };

  const showAlert = async (message: string, title = 'Alert') => {
    return await dialogStore.alert(message, title);
  };

  const showCustomDialog = async (options: any) => {
    return await dialogStore.showDialog(options);
  };

  return {
    // State
    hasDialog,
    currentDialog,
    dialogCount,
    
    // Actions
    showConfirmation,
    showAlert,
    showCustomDialog,
    
    // Direct store access
    ...dialogStore
  };
}
```

### Form Dialog Pattern

Create dialogs with form functionality:

```vue
<!-- src/components/FormDialog.vue -->
<template>
  <ModalDialog
    :title="title"
    :size="size"
    :persistent="true"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <form @submit.prevent="handleSubmit" class="form-dialog">
      <div 
        v-for="field in formFields" 
        :key="field.name"
        class="form-group"
      >
        <label :for="field.name" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        <component
          :is="getInputComponent(field.type)"
          :id="field.name"
          v-model="formData[field.name]"
          :type="field.type"
          :placeholder="field.placeholder"
          :required="field.required"
          class="form-input"
          v-bind="field.attrs || {}"
        />
        <div v-if="field.description" class="form-description">
          {{ field.description }}
        </div>
      </div>
    </form>
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useDialogStore } from '../stores/dialogStore';

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  attrs?: Record<string, any>;
}

const props = withDefaults(defineProps<{
  title: string;
  fields: FormField[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  initialData?: Record<string, any>;
}>(), {
  size: 'md',
  initialData: () => ({})
});

const emit = defineEmits<{
  submit: [data: Record<string, any>];
  cancel: [];
}>();

const dialogStore = useDialogStore();

// Initialize form data
const formData = reactive({ ...props.initialData });

// Initialize missing fields with empty values
props.fields.forEach(field => {
  if (!(field.name in formData)) {
    (formData as any)[field.name] = '';
  }
});

const getInputComponent = (type: string) => {
  switch (type) {
    case 'textarea':
      return 'textarea';
    case 'select':
      return 'select';
    default:
      return 'input';
  }
};

const handleSubmit = () => {
  emit('submit', { ...formData });
  dialogStore.hideCurrent({ ...formData });
};

const handleCancel = () => {
  emit('cancel');
  dialogStore.hideCurrent();
};
</script>

<style scoped>
.form-dialog {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-primary, #333);
}

.required {
  color: var(--error-color, #e74c3c);
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #007acc);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.form-description {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary, #666);
}
</style>
```

### Loading and Progress Dialogs

Create dialogs for long-running operations:

```vue
<!-- src/components/ProgressDialog.vue -->
<template>
  <ModalDialog
    :title="title"
    size="sm"
    :persistent="true"
    :show-confirm-button="false"
    :show-cancel-button="showCancelButton"
    @cancel="handleCancel"
  >
    <div class="progress-content">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <div class="progress-info">
        <p class="progress-text">{{ message }}</p>
        <p class="progress-percent">{{ Math.round(progress) }}%</p>
      </div>
    </div>
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDialogStore } from '../stores/dialogStore';

const props = withDefaults(defineProps<{
  title: string;
  message: string;
  progress: number; // 0-100
  showCancelButton?: boolean;
  cancelCallback?: () => void;
}>(), {
  showCancelButton: false
});

const emit = defineEmits<{
  cancel: [];
}>();

const dialogStore = useDialogStore();

// Watch for progress completion
watch(() => props.progress, (newProgress) => {
  if (newProgress >= 100) {
    // Auto-close when progress reaches 100%
    setTimeout(() => {
      dialogStore.hideCurrent();
    }, 500);
  }
});

const handleCancel = () => {
  if (props.cancelCallback) {
    props.cancelCallback();
  }
  emit('cancel');
  dialogStore.hideCurrent();
};
</script>

<style scoped>
.progress-content {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--progress-bg, #e0e0e0);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color, #007acc);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  margin: 0;
  color: var(--text-primary, #333);
}

.progress-percent {
  margin: 0;
  font-weight: bold;
  color: var(--primary-color, #007acc);
}
</style>
```

### Toast and Notification System

Implement non-modal notification system:

```vue
<!-- src/components/ToastContainer.vue -->
<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div" class="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 16 16">
              <path d="M14,4 L6,12 L2,8" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else-if="toast.type === 'error'" width="16" height="16" viewBox="0 0 16 16">
              <path d="M4,4 L12,12 M12,4 L4,12" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else-if="toast.type === 'warning'" width="16" height="16" viewBox="0 0 16 16">
              <path d="M8,2 L14,14 L2,14 Z M8,6 L8,10 M8,12 L8,12" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="2" />
              <circle cx="8" cy="11" r="1" fill="currentColor" />
              <path d="M7,7 L7,5 M9,7 L9,5" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </div>
          <div class="toast-text">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" @click="removeToast(toast.id)">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M3.5,3.5 L10.5,10.5 M10.5,3.5 L3.5,10.5" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </button>
        </div>
        <div 
          class="toast-progress" 
          :style="{ animationDuration: `${toast.duration}ms` }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const toasts = ref<Toast[]>([]);

// Methods
const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newToast = { ...toast, id };
  
  toasts.value.unshift(newToast);
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, toast.duration);
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

// Expose to global context
defineExpose({
  addToast,
  removeToast
});

// Register as global service
onMounted(() => {
  (window as any).__TOAST_SERVICE = {
    success: (message: string, title = 'Success') => addToast({ title, message, type: 'success', duration: 3000 }),
    error: (message: string, title = 'Error') => addToast({ title, message, type: 'error', duration: 5000 }),
    warning: (message: string, title = 'Warning') => addToast({ title, message, type: 'warning', duration: 4000 }),
    info: (message: string, title = 'Info') => addToast({ title, message, type: 'info', duration: 3000 })
  };
});

onUnmounted(() => {
  delete (window as any).__TOAST_SERVICE;
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
  max-width: 400px;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  background: var(--toast-bg, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-width: 320px;
}

.toast.success {
  border-left: 4px solid var(--success-color, #4caf50);
}

.toast.error {
  border-left: 4px solid var(--error-color, #f44336);
}

.toast.warning {
  border-left: 4px solid var(--warning-color, #ff9800);
}

.toast.info {
  border-left: 4px solid var(--info-color, #2196f3);
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  gap: 12px;
}

.toast-icon {
  color: var(--text-secondary, #666);
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 2px;
}

.toast-message {
  color: var(--text-secondary, #666);
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-secondary, #999);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  flex-shrink: 0;
}

.toast-close:hover {
  background: var(--hover-bg, #f5f5f5);
  color: var(--text-primary, #333);
}

.toast-progress {
  height: 2px;
  background: var(--progress-color, #e0e0e0);
}

.toast-progress {
  animation: progress linear;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

/* Transitions */
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
  transform: translateX(0);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
```

## Testing

Test your dialog systems for proper functionality:

```typescript
// src/__tests__/dialogSystem.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ModalDialog from '../components/ModalDialog.vue';
import { DialogService } from '../services/dialogService';

// Mock Tauri API
vi.mock('@tauri-apps/api', async () => {
  const actual = await vi.importActual('@tauri-apps/api');
  return {
    ...actual,
    dialog: {
      message: vi.fn(() => Promise.resolve(true)),
      confirm: vi.fn(() => Promise.resolve(true)),
      ask: vi.fn(() => Promise.resolve(true)),
      save: vi.fn(() => Promise.resolve('')),
      open: vi.fn(() => Promise.resolve(''))
    }
  };
});

describe('Dialog System', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders modal dialog with title and message', () => {
    const wrapper = mount(ModalDialog, {
      props: {
        title: 'Test Title',
        message: 'Test Message'
      }
    });

    expect(wrapper.find('.modal-title').text()).toBe('Test Title');
    expect(wrapper.find('.modal-message').text()).toBe('Test Message');
  });

  it('emits confirm event when confirm button is clicked', async () => {
    const wrapper = mount(ModalDialog, {
      props: {
        title: 'Confirm',
        message: 'Are you sure?'
      }
    });

    const confirmButton = wrapper.find('.btn-primary');
    await confirmButton.trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(ModalDialog, {
      props: {
        title: 'Test',
        message: 'Test message'
      }
    });

    const cancelButton = wrapper.find('.btn-secondary');
    await cancelButton.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('closes when clicking outside if not persistent', async () => {
    const wrapper = mount(ModalDialog, {
      props: {
        title: 'Test',
        message: 'Test message',
        persistent: false
      }
    });

    const overlay = wrapper.find('.modal-overlay');
    await overlay.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('does not close when clicking outside if persistent', async () => {
    const wrapper = mount(ModalDialog, {
      props: {
        title: 'Test',
        message: 'Test message',
        persistent: true
      }
    });

    const overlay = wrapper.find('.modal-overlay');
    await overlay.trigger('click');

    expect(wrapper.emitted('cancel')).toBeUndefined();
  });

  it('manages dialog queue properly', async () => {
    const service = new DialogService();
    
    // Mock the container for testing
    const container = document.createElement('div');
    container.id = 'dialog-container';
    document.body.appendChild(container);

    // Test queue behavior
    const firstPromise = service.showAlertDialog({ message: 'First dialog' });
    const secondPromise = service.showAlertDialog({ message: 'Second dialog' });
    
    // First dialog should be shown, second should be queued
    expect(container.children).toHaveLength(1);
    
    document.body.removeChild(container);
  });
});
```

## Troubleshooting

Common dialog system challenges and solutions:

- **Memory Leaks**: Always clean up dialog containers and event listeners
- **Focus Management**: Properly handle focus trapping and restoration
- **Keyboard Navigation**: Ensure dialogs are accessible via keyboard
- **Stacking Context**: Manage z-index and overlay layers properly
- **Responsive Design**: Dialogs should work well on different screen sizes

## Summary

Effective dialog management in Tauri applications requires balancing native system integration with flexible Vue component architecture. By implementing modular, well-architected dialog systems with proper state management, you can create professional desktop applications with intuitive user interactions.

Continue exploring related topics in our guide to [Events](./02_07_vue-events.md) to learn how to implement user interactions in your applications.