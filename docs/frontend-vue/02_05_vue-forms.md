# Forms

Handling forms in Tauri applications requires special attention to validation, error handling, and integration with backend commands. This article covers comprehensive form management patterns for Vue.js applications with Tauri backend integration.

## Basic Form Implementation

### Simple Form with Tauri Integration

```vue
<template>
  <form @submit.prevent="submitForm" class="user-form">
    <div class="form-group">
      <label for="username">Username</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        :class="{ error: errors.username }"
        required
      />
      <span v-if="errors.username" class="error-message">
        {{ errors.username }}
      </span>
    </div>
    
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :class="{ error: errors.email }"
        required
      />
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        :class="{ error: errors.password }"
        required
        minlength="8"
      />
      <span v-if="errors.password" class="error-message">
        {{ errors.password }}
      </span>
    </div>
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Submitting...' : 'Submit' }}
    </button>
    
    <div v-if="message" :class="`message ${message.type}`">
      {{ message.text }}
    </div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const errors = ref({})
const loading = ref(false)
const message = ref(null)

const validateForm = () => {
  const newErrors = {}
  
  if (!form.username.trim()) {
    newErrors.username = 'Username is required'
  } else if (form.username.length < 3) {
    newErrors.username = 'Username must be at least 3 characters'
  }
  
  if (!form.email.trim()) {
    newErrors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    newErrors.email = 'Please enter a valid email'
  }
  
  if (!form.password) {
    newErrors.password = 'Password is required'
  } else if (form.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return
  
  loading.value = true
  message.value = null
  
  try {
    const result = await invoke('create_user', {
      username: form.username,
      email: form.email,
      password: form.password
    })
    
    message.value = { type: 'success', text: 'User created successfully!' }
    
    // Reset form
    form.username = ''
    form.email = ''
    form.password = ''
    errors.value = {}
  } catch (error) {
    message.value = { type: 'error', text: error.message }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

button {
  width: 100%;
  padding: 10px;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.message {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
```

## Advanced Form Validation with Custom Composition Function

### Create a Form Validation Composable

```javascript
// composables/useFormValidation.js
import { ref, reactive } from 'vue'

export function useFormValidation(initialState, validators) {
  const form = reactive({ ...initialState })
  const errors = ref({})
  const touched = ref({})
  
  const validateField = (field, value) => {
    if (!validators[field]) return null
    
    for (const [ruleName, rule] of Object.entries(validators[field])) {
      const result = rule(value, form)
      if (result !== true) {
        return result
      }
    }
    return null
  }
  
  const validateAll = () => {
    const newErrors = {}
    let isValid = true
    
    for (const field in validators) {
      const error = validateField(field, form[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    }
    
    errors.value = newErrors
    return isValid
  }
  
  const markTouched = (field) => {
    touched.value[field] = true
  }
  
  const reset = () => {
    Object.keys(form).forEach(key => {
      form[key] = initialState[key]
    })
    errors.value = {}
    touched.value = {}
  }
  
  return {
    form,
    errors,
    touched,
    validateField,
    validateAll,
    markTouched,
    reset
  }
}
```

### Using the Validation Composable

```vue
<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label for="firstName">First Name</label>
      <input
        id="firstName"
        v-model="form.firstName"
        @blur="markTouched('firstName')"
        :class="{ error: hasError('firstName') }"
        type="text"
      />
      <span v-if="hasError('firstName')" class="error">
        {{ errors.firstName }}
      </span>
    </div>
    
    <div class="form-group">
      <label for="lastName">Last Name</label>
      <input
        id="lastName"
        v-model="form.lastName"
        @blur="markTouched('lastName')"
        :class="{ error: hasError('lastName') }"
        type="text"
      />
      <span v-if="hasError('lastName')" class="error">
        {{ errors.lastName }}
      </span>
    </div>
    
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        @input="validateField('email', form.email)"
        @blur="markTouched('email')"
        :class="{ error: hasError('email') }"
        type="email"
      />
      <span v-if="hasError('email')" class="error">
        {{ errors.email }}
      </span>
    </div>
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Saving...' : 'Save Profile' }}
    </button>
  </form>
</template>

<script setup>
import { useFormValidation } from '@/composables/useFormValidation'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const { form, errors, touched, validateAll, markTouched, validateField, reset } = 
  useFormValidation(
    {
      firstName: '',
      lastName: '',
      email: ''
    },
    {
      firstName: {
        required: (value) => value.trim() ? true : 'First name is required',
        min: (value) => value.trim().length >= 2 ? true : 'Must be at least 2 characters'
      },
      lastName: {
        required: (value) => value.trim() ? true : 'Last name is required',
        min: (value) => value.trim().length >= 2 ? true : 'Must be at least 2 characters'
      },
      email: {
        required: (value) => value.trim() ? true : 'Email is required',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? true : 'Invalid email format'
      }
    }
  )

const loading = ref(false)

const hasError = (field) => {
  return touched.value[field] && errors.value[field]
}

const submitForm = async () => {
  if (!validateAll()) return
  
  loading.value = true
  try {
    await invoke('update_profile', { ...form })
    alert('Profile updated successfully!')
    reset()
  } catch (error) {
    console.error('Update failed:', error)
    alert('Failed to update profile: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
```

## Real-time Validation with Backend

### Backend Validation Integration

```vue
<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label>Username</label>
      <input
        v-model="form.username"
        @input="validateUsername"
        @blur="clearUsernameMessage"
        :class="{ error: usernameError, success: usernameValid }"
        type="text"
      />
      <div v-if="usernameLoading" class="loading">Checking...</div>
      <div v-else-if="usernameMessage" :class="`message ${usernameMessageType}`">
        {{ usernameMessage }}
      </div>
    </div>
    
    <button type="submit" :disabled="!isFormValid">
      Submit
    </button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { debounce } from 'lodash-es'

const form = ref({ username: '' })
const usernameValid = ref(null)
const usernameError = ref(null)
const usernameLoading = ref(false)
const usernameMessage = ref('')
const usernameMessageType = ref('')

// Debounced validation to avoid too many backend calls
const validateUsername = debounce(async () => {
  const username = form.value.username.trim()
  
  if (username.length < 3) {
    clearUsernameValidation()
    return
  }
  
  usernameLoading.value = true
  usernameMessage.value = ''
  
  try {
    const result = await invoke('validate_username', { username })
    
    if (result.valid) {
      usernameValid.value = true
      usernameError.value = false
      usernameMessage.value = 'Username is available'
      usernameMessageType.value = 'success'
    } else {
      usernameValid.value = false
      usernameError.value = true
      usernameMessage.value = result.reason || 'Username not available'
      usernameMessageType.value = 'error'
    }
  } catch (error) {
    usernameValid.value = false
    usernameError.value = true
    usernameMessage.value = 'Validation failed'
    usernameMessageType.value = 'error'
  } finally {
    usernameLoading.value = false
  }
}, 500)

const clearUsernameValidation = () => {
  usernameValid.value = null
  usernameError.value = null
  usernameMessage.value = ''
  usernameMessageType.value = ''
}

const clearUsernameMessage = () => {
  usernameMessage.value = ''
}

const isFormValid = computed(() => {
  return form.value.username.trim().length >= 3 && usernameValid.value
})

const submitForm = async () => {
  if (!isFormValid.value) return
  
  try {
    await invoke('create_account', { ...form.value })
    alert('Account created successfully!')
  } catch (error) {
    alert('Failed to create account: ' + error.message)
  }
}
</script>
```

## Complex Forms with Sections

### Multi-Step Form Component

```vue
<template>
  <div class="multi-step-form">
    <!-- Progress indicator -->
    <div class="progress">
      <div 
        v-for="step in steps" 
        :key="step.id"
        class="step"
        :class="{ active: currentStep === step.id, completed: step.id < currentStep }"
      >
        <div class="step-number">{{ step.id }}</div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>
    
    <!-- Step content -->
    <div class="step-content">
      <div v-if="currentStep === 1">
        <h3>Personal Information</h3>
        <PersonalInfoForm v-model="formData.personal" @validate="validatePersonal" />
      </div>
      
      <div v-if="currentStep === 2">
        <h3>Account Details</h3>
        <AccountForm v-model="formData.account" @validate="validateAccount" />
      </div>
      
      <div v-if="currentStep === 3">
        <h3>Preferences</h3>
        <PreferencesForm v-model="formData.preferences" @validate="validatePreferences" />
      </div>
    </div>
    
    <!-- Navigation buttons -->
    <div class="form-nav">
      <button 
        v-if="currentStep > 1" 
        @click="prevStep"
        type="button"
      >
        Previous
      </button>
      
      <button 
        v-if="currentStep < steps.length" 
        @click="nextStep"
        :disabled="!isCurrentStepValid"
      >
        Next
      </button>
      
      <button 
        v-if="currentStep === steps.length" 
        @click="submitForm"
        :disabled="submitting"
      >
        {{ submitting ? 'Submitting...' : 'Submit' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Account' },
  { id: 3, label: 'Preferences' }
]

const currentStep = ref(1)
const formData = ref({
  personal: {},
  account: {},
  preferences: {}
})

const stepValidations = ref({
  1: false,
  2: false,
  3: false
})

const submitting = ref(false)

const isCurrentStepValid = computed(() => {
  return stepValidations.value[currentStep.value] || false
})

const validatePersonal = (isValid) => {
  stepValidations.value[1] = isValid
}

const validateAccount = (isValid) => {
  stepValidations.value[2] = isValid
}

const validatePreferences = (isValid) => {
  stepValidations.value[3] = isValid
}

const nextStep = () => {
  if (isCurrentStepValid.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitForm = async () => {
  if (!stepValidations.value[3]) return
  
  submitting.value = true
  try {
    await invoke('create_complete_profile', { ...formData.value })
    alert('Profile created successfully!')
    // Reset form or navigate to success page
  } catch (error) {
    alert('Submission failed: ' + error.message)
  } finally {
    submitting.value = false
  }
}
</script>
```

## File Upload Forms

### File Upload with Progress

```vue
<template>
  <form @submit.prevent="submitForm" class="upload-form">
    <div class="file-upload-area" @dragover.prevent @drop.prevent="handleDrop">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileSelect"
        style="display: none"
        multiple
      />
      
      <div 
        class="upload-area"
        @click="selectFiles"
      >
        <p>Drag & drop files here or click to select</p>
        <button type="button">Select Files</button>
      </div>
      
      <div v-if="files.length" class="file-list">
        <div 
          v-for="(file, index) in files" 
          :key="index"
          class="file-item"
        >
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatSize(file.size) }}</span>
          </div>
          
          <div v-if="file.status === 'uploading'" class="upload-progress">
            <div 
              class="progress-bar"
              :style="{ width: file.progress + '%' }"
            ></div>
            <span class="progress-text">{{ file.progress }}%</span>
          </div>
          
          <div v-else class="file-status">
            <span :class="`status-${file.status}`">
              {{ file.status }}
            </span>
            <button 
              v-if="file.status !== 'completed'" 
              @click="removeFile(index)"
              type="button"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <button type="submit" :disabled="!hasFiles || isUploading">
      {{ isUploading ? 'Uploading...' : 'Upload Files' }}
    </button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const fileInput = ref(null)
const files = ref([])

const hasFiles = computed(() => files.value.length > 0)
const isUploading = computed(() => 
  files.value.some(file => file.status === 'uploading')
)

const selectFiles = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  addFiles(selectedFiles)
}

const handleDrop = (event) => {
  const droppedFiles = Array.from(event.dataTransfer.files)
  addFiles(droppedFiles)
}

const addFiles = (newFiles) => {
  newFiles.forEach(file => {
    files.value.push({
      file,
      name: file.name,
      size: file.size,
      status: 'selected', // selected, uploading, completed, error
      progress: 0
    })
  })
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFile = async (fileItem) => {
  fileItem.status = 'uploading'
  
  try {
    // Convert file to base64 for transmission
    const base64 = await fileToBase64(fileItem.file)
    
    // Upload with progress tracking
    const result = await invoke('upload_file', {
      filename: fileItem.file.name,
      content: base64,
      onProgress: (progress) => {
        fileItem.progress = Math.round(progress * 100)
      }
    })
    
    fileItem.status = 'completed'
    return result
  } catch (error) {
    fileItem.status = 'error'
    console.error('Upload failed:', error)
    throw error
  }
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const submitForm = async () => {
  const uploadPromises = files.value
    .filter(file => file.status === 'selected')
    .map(file => uploadFile(file))
  
  try {
    await Promise.all(uploadPromises)
    alert('All files uploaded successfully!')
    // Reset form
    files.value = []
  } catch (error) {
    alert('Some uploads failed: ' + error.message)
  }
}
</script>
```

## Form State Management with Pinia

### Form Store Pattern

```javascript
// stores/formStore.js
import { defineStore } from 'pinia'

export const useFormStore = defineStore('form', {
  state: () => ({
    forms: new Map(),
    validations: new Map()
  }),
  
  actions: {
    setFormState(formId, state) {
      this.forms.set(formId, { ...state, lastUpdated: Date.now() })
    },
    
    getFormState(formId) {
      return this.forms.get(formId)
    },
    
    setFormValidation(formId, validation) {
      this.validations.set(formId, validation)
    },
    
    clearForm(formId) {
      this.forms.delete(formId)
      this.validations.delete(formId)
    },
    
    // Save form state to backend
    async saveFormState(formId, endpoint) {
      const state = this.forms.get(formId)
      if (!state) return
      
      try {
        await invoke(endpoint, state)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  },
  
  getters: {
    hasUnsavedChanges: (state) => (formId) => {
      const formState = state.forms.get(formId)
      return formState && formState.lastUpdated && 
             Date.now() - formState.lastUpdated < 300000 // 5 minutes
    }
  }
})
```

## Best Practices for Tauri Form Integration

### 1. Error Handling

```javascript
// utils/formErrorHandler.js
export function handleFormError(error, formComponent) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors from backend
    formComponent.errors = error.details
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network issues
    formComponent.message = { 
      type: 'error', 
      text: 'Network connection failed. Please try again.' 
    }
  } else {
    // Handle generic errors
    formComponent.message = { 
      type: 'error', 
      text: error.message || 'An unexpected error occurred' 
    }
  }
}
```

### 2. Loading States Management

```vue
<template>
  <div class="form-container">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Processing...</p>
    </div>
    
    <form @submit.prevent="submitForm">
      <!-- Form content -->
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const loading = ref(false)

const submitForm = async () => {
  loading.value = true
  try {
    await invoke('process_form', formData.value)
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    loading.value = false
  }
}
</script>
```

### 3. Form Persistence

```javascript
// composables/useFormPersistence.js
import { watch } from 'vue'

export function useFormPersistence(formState, formId) {
  // Auto-save form state
  const autoSave = (state) => {
    localStorage.setItem(`form-${formId}`, JSON.stringify(state))
  }
  
  // Restore form state
  const restore = () => {
    const saved = localStorage.getItem(`form-${formId}`)
    if (saved) {
      return JSON.parse(saved)
    }
    return null
  }
  
  // Watch for changes and auto-save
  watch(formState, (newState) => {
    autoSave(newState)
  }, { deep: true })
  
  return { restore, autoSave }
}
```

## Testing Forms

### Form Component Testing

```javascript
// tests/unit/form.test.js
import { mount } from '@vue/test-utils'
import { beforeEach, afterEach, vi } from 'vitest'
import UserForm from '@/components/UserForm.vue'
import { invoke } from '@tauri-apps/api/tauri'

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn()
}))

describe('UserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  test('submits form correctly', async () => {
    const mockInvoke = invoke
    mockInvoke.mockResolvedValue({ success: true })
    
    const wrapper = mount(UserForm)
    
    // Fill form
    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#password').setValue('password123')
    
    // Submit
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(mockInvoke).toHaveBeenCalledWith('create_user', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    })
  })
  
  test('shows validation errors', async () => {
    const wrapper = mount(UserForm)
    
    // Submit empty form
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.text()).toContain('Username is required')
    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.text()).toContain('Password is required')
  })
})
```

## Summary

Effective form management in Tauri applications requires attention to:

1. **Client-side validation** with real-time feedback
2. **Backend integration** for complex validation
3. **Loading states** to indicate processing
4. **Error handling** for different failure scenarios
5. **Performance optimization** for large forms
6. **Data persistence** to prevent data loss
7. **Accessibility** for all users

Following these patterns will help you create robust, user-friendly forms that integrate seamlessly with your Tauri backend commands.