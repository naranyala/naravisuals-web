import { defineComponent, PropType, ref, watch } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

interface Tab {
  key: string
  title: string
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  modelValue: string
  className?: string
}

const styles = {
  container: css`
    width: 100%;
  `,

  tabList: css`
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1.5rem;
  `,

  tab: css`
    position: relative;
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      color: #374151;
      background: #f9fafb;
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  `,

  activeTab: css`
    color: #3b82f6;
    background: white;
    border-bottom: 2px solid #3b82f6;
    margin-bottom: -1px;

    &:hover {
      color: #2563eb;
      background: white;
    }
  `,

  disabledTab: css`
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      color: #6b7280;
      background: none;
    }
  `,

  content: css`
    padding: 1rem 0;
  `
}

export default defineComponent({
  name: 'Tabs',

  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true
    },
    modelValue: {
      type: String,
      required: true
    },
    className: String
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit, slots }) {
    const activeTab = ref(props.modelValue)

    watch(() => props.modelValue, (newValue) => {
      activeTab.value = newValue
    })

    const handleTabClick = (tab: Tab) => {
      if (tab.disabled) return

      activeTab.value = tab.key
      emit('update:modelValue', tab.key)
      emit('change', tab.key)
    }

    return () => (
      <div class={clsx(styles.container, props.className)}>
        <div class={styles.tabList}>
          {props.tabs.map(tab => (
            <button
              key={tab.key}
              class={clsx(
                styles.tab,
                activeTab.value === tab.key && styles.activeTab,
                tab.disabled && styles.disabledTab
              )}
              onClick={() => handleTabClick(tab)}
              disabled={tab.disabled}
            >
              {tab.title}
            </button>
          ))}
        </div>

        <div class={styles.content}>
          {slots[activeTab.value]?.() || slots.default?.()}
        </div>
      </div>
    )
  }
})
