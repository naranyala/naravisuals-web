import { defineComponent, PropType, ref, onMounted, watch } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

interface CodeEditorProps {
  modelValue: string
  language?: string
  theme?: 'light' | 'dark'
  lineNumbers?: boolean
  readonly?: boolean
  placeholder?: string
  className?: string
}

const styles = {
  container: css`
    position: relative;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  `,

  header: css`
    background: #f9fafb;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,

  language: css`
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
  `,

  editorWrapper: css`
    position: relative;
    display: flex;
    min-height: 200px;
    max-height: 500px;
    overflow: auto;
  `,

  lineNumbers: css`
    background: #f9fafb;
    padding: 1rem 0.75rem;
    border-right: 1px solid #e5e7eb;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #9ca3af;
    user-select: none;
    min-width: 3rem;
    text-align: right;
  `,

  editor: css`
    flex: 1;
    padding: 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    background: white;
    color: #111827;
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;

    &::placeholder {
      color: #9ca3af;
    }

    &.dark {
      background: #1f2937;
      color: #f9fafb;
    }
  `,

  footer: css`
    background: #f9fafb;
    padding: 0.5rem 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: #6b7280;
  `,

  stats: css`
    display: flex;
    gap: 1rem;
  `,

  actions: css`
    display: flex;
    gap: 0.5rem;
  `,

  button: css`
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;

    &:hover {
      background: #e5e7eb;
      color: #374151;
    }
  `
}

export default defineComponent({
  name: 'CodeEditor',

  props: {
    modelValue: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    theme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light'
    },
    lineNumbers: {
      type: Boolean,
      default: true
    },
    readonly: Boolean,
    placeholder: String,
    className: String
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    const editorRef = ref<HTMLTextAreaElement>()
    const content = ref(props.modelValue)
    const cursorPosition = ref({ line: 1, column: 1 })

    const lineCount = computed(() => content.value.split('\n').length)
    const characterCount = computed(() => content.value.length)
    const wordCount = computed(() => content.value.trim().split(/\s+/).filter(Boolean).length)

    watch(() => props.modelValue, (newValue) => {
      if (newValue !== content.value) {
        content.value = newValue
      }
    })

    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement
      content.value = target.value
      updateCursorPosition()
      emit('update:modelValue', content.value)
      emit('change', content.value)
    }

    const updateCursorPosition = () => {
      if (!editorRef.value) return

      const textarea = editorRef.value
      const text = textarea.value.substring(0, textarea.selectionStart)
      const lines = text.split('\n')

      cursorPosition.value = {
        line: lines.length,
        column: lines[lines.length - 1].length + 1
      }
    }

    const formatCode = () => {
      // Simple formatting - in real app would use proper formatter
      content.value = content.value
        .replace(/;/g, ';\n')
        .replace(/{/g, ' {\n  ')
        .replace(/}/g, '\n}')
        .replace(/\n\s*\n/g, '\n')

      emit('update:modelValue', content.value)
    }

    const clearCode = () => {
      content.value = ''
      emit('update:modelValue', '')
    }

    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(content.value)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }

    const lineNumbersContent = computed(() => {
      return Array.from({ length: lineCount.value }, (_, i) => i + 1).join('\n')
    })

    onMounted(() => {
      if (editorRef.value) {
        editorRef.value.focus()
        updateCursorPosition()
      }
    })

    return () => (
      <div class={clsx(styles.container, props.className)}>
        <div class={styles.header}>
          <div class={styles.language}>{props.language}</div>
          <div class={styles.actions}>
            <button class={styles.button} onClick={formatCode}>
              Format
            </button>
            <button class={styles.button} onClick={copyCode}>
              Copy
            </button>
          </div>
        </div>

        <div class={styles.editorWrapper}>
          {props.lineNumbers && (
            <div class={styles.lineNumbers}>
              <pre>{lineNumbersContent.value}</pre>
            </div>
          )}

          <textarea
            ref={editorRef}
            class={clsx(styles.editor, props.theme === 'dark' && 'dark')}
            value={content.value}
            placeholder={props.placeholder}
            readonly={props.readonly}
            spellcheck={false}
            onInput={handleInput}
            onKeyup={updateCursorPosition}
            onClick={updateCursorPosition}
          />
        </div>

        <div class={styles.footer}>
          <div class={styles.stats}>
            <span>Line {cursorPosition.value.line}, Column {cursorPosition.value.column}</span>
            <span>{characterCount.value} chars</span>
            <span>{wordCount.value} words</span>
          </div>
          <div class={styles.actions}>
            <button class={styles.button} onClick={clearCode}>
              Clear
            </button>
          </div>
        </div>
      </div>
    )
  }
})
