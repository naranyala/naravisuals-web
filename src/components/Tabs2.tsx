// src/components/Tabs.tsx
import { defineComponent, PropType, ref, computed } from 'vue'
import { css } from "goober"
import clsx from "clsx"

const styles = {
  tabs: css`
    width: 100%;
  `,

  tabList: css`
    display: flex;
    border-bottom: 2px solid #e5e7eb;
    gap: 4px;
  `,

  tab: css<{ isActive: boolean }>`
    padding: 12px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid ${props => props.isActive ? '#3b82f6' : 'transparent'};
    color: ${props => props.isActive ? '#3b82f6' : '#6b7280'};
    font-weight: ${props => props.isActive ? 600 : 500};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: -2px;

    &:hover {
      color: ${props => props.isActive ? '#3b82f6' : '#374151'};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  tabPanel: css`
    padding: 24px 0;
  `
}

interface Tab {
  id: string
  label: string
  disabled?: boolean
  icon?: string
}

interface TabsProps {
  tabs: Tab[]
  defaultActiveTab?: string
  onChange?: (tabId: string) => void
}

export const Tabs = defineComponent({
  name: 'Tabs',
  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true
    },
    defaultActiveTab: String,
    onChange: Function as PropType<(tabId: string) => void>
  },
  setup(props, { slots }) {
    const activeTab = ref(props.defaultActiveTab || props.tabs[0]?.id || '')

    const activeTabIndex = computed(() =>
      props.tabs.findIndex(tab => tab.id === activeTab.value)
    )

    const setActiveTab = (tabId: string) => {
      const tab = props.tabs.find(t => t.id === tabId)
      if (tab && !tab.disabled) {
        activeTab.value = tabId
        props.onChange?.(tabId)
      }
    }

    return {
      activeTab,
      activeTabIndex,
      setActiveTab
    }
  },
  render() {
    return (
      <div class={styles.tabs}>
        <div class={styles.tabList} role="tablist">
          {this.tabs.map(tab => (
            <button
              key={tab.id}
              class={styles.tab({ isActive: this.activeTab === tab.id })}
              onClick={() => this.setActiveTab(tab.id)}
              disabled={tab.disabled}
              role="tab"
              aria-selected={this.activeTab === tab.id}
            >
              {tab.icon && <i class={tab.icon} style="margin-right: 8px" />}
              {tab.label}
            </button>
          ))}
        </div>

        <div class={styles.tabPanel} role="tabpanel">
          {this.$slots[this.activeTab]?.() || this.$slots.default?.()}
        </div>
      </div>
    )
  }
})
