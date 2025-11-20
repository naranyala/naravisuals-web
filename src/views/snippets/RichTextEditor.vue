<template>
  <div class="rich-text-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button
          v-for="format in textFormats"
          :key="format.name"
          :class="['toolbar-btn', { active: isFormatActive(format.command) }]"
          @click="execCommand(format.command, format.value)"
          :title="format.title"
        >
          {{ format.icon }}
        </button>
      </div>

      <div class="toolbar-group">
        <select v-model="selectedFont" @change="changeFontFamily" class="font-select">
          <option value="">Font</option>
          <option v-for="font in fontFamilies" :key="font" :value="font">
            {{ font }}
          </option>
        </select>

        <select v-model="selectedSize" @change="changeFontSize" class="size-select">
          <option value="">Size</option>
          <option v-for="size in fontSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>

      <div class="toolbar-group">
        <button
          v-for="action in editorActions"
          :key="action.name"
          class="toolbar-btn"
          @click="execCommand(action.command)"
          :title="action.title"
        >
          {{ action.icon }}
        </button>
      </div>
    </div>

    <!-- Editor Area -->
    <div
      ref="editor"
      class="editor-content"
      contenteditable="true"
      @input="onInput"
      @blur="onBlur"
      @keydown="onKeydown"
      :style="editorStyles"
    ></div>

    <!-- Character Count -->
    <div class="editor-footer">
      <span class="char-count">
        {{ characterCount }} characters
      </span>
      <span v-if="maxLength" class="char-limit">
        / {{ maxLength }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start typing...'
  },
  maxLength: {
    type: Number,
    default: null
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

const editor = ref(null)
const selectedFont = ref('')
const selectedSize = ref('')

const textFormats = [
  { name: 'bold', command: 'bold', icon: 'B', title: 'Bold' },
  { name: 'italic', command: 'italic', icon: 'I', title: 'Italic' },
  { name: 'underline', command: 'underline', icon: 'U', title: 'Underline' },
  { name: 'strike', command: 'strikeThrough', icon: 'S', title: 'Strikethrough' }
]

const editorActions = [
  { name: 'undo', command: 'undo', icon: '↶', title: 'Undo' },
  { name: 'redo', command: 'redo', icon: '↷', title: 'Redo' },
  { name: 'link', command: 'createLink', icon: '🔗', title: 'Insert Link' },
  { name: 'image', command: 'insertImage', icon: '🖼️', title: 'Insert Image' }
]

const fontFamilies = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New']
const fontSizes = ['12px', '14px', '16px', '18px', '24px', '32px']

const characterCount = computed(() => {
  return props.modelValue.length
})

const editorStyles = computed(() => ({
  cursor: props.readonly ? 'not-allowed' : 'text',
  opacity: props.readonly ? 0.7 : 1
}))

const execCommand = (command, value = null) => {
  if (props.readonly) return
  
  document.execCommand(command, false, value)
  editor.value?.focus()
  updateModelValue()
}

const isFormatActive = (command) => {
  return document.queryCommandState(command)
}

const changeFontFamily = () => {
  if (selectedFont.value) {
    execCommand('fontName', selectedFont.value)
  }
}

const changeFontSize = () => {
  if (selectedSize.value) {
    execCommand('fontSize', selectedSize.value)
  }
}

const onInput = () => {
  updateModelValue()
}

const onBlur = (event) => {
  updateModelValue()
  emit('blur', event)
}

const onKeydown = (event) => {
  if (props.maxLength && characterCount.value >= props.maxLength) {
    // Allow navigation and deletion keys
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
      'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'
    ]
    
    if (!allowedKeys.includes(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
  }
}

const updateModelValue = () => {
  if (editor.value) {
    const content = editor.value.innerHTML
    emit('update:modelValue', content)
    emit('change', content)
  }
}

const setContent = (content) => {
  if (editor.value) {
    editor.value.innerHTML = content
  }
}

const clear = () => {
  setContent('')
}

const getPlainText = () => {
  return editor.value?.textContent || ''
}

const getHTML = () => {
  return editor.value?.innerHTML || ''
}

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.innerHTML !== newValue) {
    editor.value.innerHTML = newValue
  }
})

onMounted(() => {
  if (editor.value && props.modelValue) {
    editor.value.innerHTML = props.modelValue
  }
  
  if (props.placeholder && editor.value) {
    editor.value.setAttribute('placeholder', props.placeholder)
  }
})

defineExpose({
  setContent,
  clear,
  getPlainText,
  getHTML,
  execCommand
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 32px;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.toolbar-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.font-select,
.size-select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.editor-content {
  min-height: 200px;
  max-height: 400px;
  padding: 16px;
  overflow-y: auto;
  outline: none;
  line-height: 1.6;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #9ca3af;
}

.editor-footer {
  padding: 8px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  text-align: right;
  font-size: 12px;
  color: #6b7280;
}

.char-count {
  font-weight: 500;
}

.char-limit {
  color: #9ca3af;
}
</style>
