import { defineComponent, PropType, ref, computed, watch } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

interface MultiSelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  modelValue: (string | number)[]
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  max?: number
  className?: string
}

const styles = {
  container: css`
    position: relative;
    width: 100%;
    max-width: 400px;
  `,

  trigger: css`
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;

    &:hover {
      border-color: #9ca3af;
    }

    &.open {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  `,

  placeholder: css`
    color: #9ca3af;
    font-size: 0.875rem;
  `,

  selectedItems: css`
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  `,

  selectedItem: css`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: #eff6ff;
    color: #3b82f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  `,

  removeButton: css`
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
    line-height: 1;

    &:hover {
      color: #374151;
    }
  `,

  dropdownIcon: css`
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
    transition: transform 0.2s ease;

    &.open {
      transform: translateY(-50%) rotate(180deg);
    }
  `,

  dropdown: css`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 50;
    margin-top: 0.25rem;
    max-height: 300px;
    overflow-y: auto;
  `,

  searchInput: css`
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.875rem;
    outline: none;

    &:focus {
      border-bottom-color: #3b82f6;
    }
  `,

  optionList: css`
    padding: 0.5rem 0;
  `,

  option: css`
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover:not(.disabled) {
      background: #f9fafb;
    }

    &.selected {
      background: #eff6ff;
      color: #3b82f6;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  checkbox: css`
    width: 1rem;
    height: 1rem;
  `,

  emptyState: css`
    padding: 2rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
  `,

  footer: css`
    padding: 0.75rem 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: #6b7280;
  `,

  clearButton: css`
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 0.75rem;

    &:hover {
      color: #374151;
    }
  `
}

export default defineComponent({
  name: 'MultiSelect',

  props: {
    options: {
      type: Array as PropType<MultiSelectOption[]>,
      required: true
    },
    modelValue: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Select options...'
    },
    searchable: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    max: Number,
    className: String
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    const isOpen = ref(false)
    const searchQuery = ref('')
    const selectedValues = ref<(string | number)[]>([...props.modelValue])

    watch(() => props.modelValue, (newValue) => {
      selectedValues.value = [...newValue]
    })

    const filteredOptions = computed(() => {
      if (!searchQuery.value) return props.options

      const query = searchQuery.value.toLowerCase()
      return props.options.filter(option =>
        option.label.toLowerCase().includes(query) ||
        option.value.toString().toLowerCase().includes(query)
      )
    })

    const selectedOptions = computed(() => {
      return props.options.filter(option => selectedValues.value.includes(option.value))
    })

    const isSelected = (option: MultiSelectOption) => {
      return selectedValues.value.includes(option.value)
    }

    const toggleOption = (option: MultiSelectOption) => {
      if (option.disabled) return

      const index = selectedValues.value.indexOf(option.value)

      if (index > -1) {
        selectedValues.value.splice(index, 1)
      } else {
        if (props.max && selectedValues.value.length >= props.max) {
          return
        }
        selectedValues.value.push(option.value)
      }

      emit('update:modelValue', [...selectedValues.value])
      emit('change', [...selectedValues.value])
    }

    const removeOption = (option: MultiSelectOption) => {
      const index = selectedValues.value.indexOf(option.value)
      if (index > -1) {
        selectedValues.value.splice(index, 1)
        emit('update:modelValue', [...selectedValues.value])
        emit('change', [...selectedValues.value])
      }
    }

    const clearAll = () => {
      selectedValues.value = []
      emit('update:modelValue', [])
      emit('change', [])
    }

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }

    const handleClickOutside = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target.closest('.multiselect-container')) {
        isOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => (
      <div class={clsx(styles.container, 'multiselect-container', props.className)}>
        <div
          class={clsx(styles.trigger, isOpen.value && 'open')}
          onClick={toggleDropdown}
        >
          {selectedOptions.value.length === 0 ? (
            <div class={styles.placeholder}>{props.placeholder}</div>
          ) : (
            <div class={styles.selectedItems}>
              {selectedOptions.value.map(option => (
                <div key={option.value} class={styles.selectedItem}>
                  <span>{option.label}</span>
                  <button
                    class={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeOption(option)
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div class={clsx(styles.dropdownIcon, isOpen.value && 'open')}>
            ▼
          </div>
        </div>

        {isOpen.value && (
          <div class={styles.dropdown}>
            {props.searchable && (
              <input
                type="text"
                class={styles.searchInput}
                placeholder="Search options..."
                v-model={searchQuery.value}
              />
            )}

            <div class={styles.optionList}>
              {filteredOptions.value.length === 0 ? (
                <div class={styles.emptyState}>No options found</div>
              ) : (
                filteredOptions.value.map(option => (
                  <label
                    key={option.value}
                    class={clsx(
                      styles.option,
                      isSelected(option) && 'selected',
                      option.disabled && 'disabled'
                    )}
                  >
                    <input
                      type="checkbox"
                      class={styles.checkbox}
                      checked={isSelected(option)}
                      disabled={option.disabled}
                      onChange={() => toggleOption(option)}
                    />
                    {option.label}
                  </label>
                ))
              )}
            </div>

            <div class={styles.footer}>
              <span>{selectedValues.value.length} selected</span>
              {props.clearable && selectedValues.value.length > 0 && (
                <button class={styles.clearButton} onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
})
