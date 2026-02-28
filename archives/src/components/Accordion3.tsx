// src/components/Accordion.tsx

import clsx from 'clsx';
import { css } from 'goober';
import { computed, defineComponent, type PropType, ref } from 'vue';

const styles = {
  accordion: css`
    width: 100%;
  `,

  item: css`
    border-bottom: 1px solid #e5e7eb;

    &:first-child {
      border-top: 1px solid #e5e7eb;
    }
  `,

  trigger: css<{ isOpen: boolean }>`
    width: 100%;
    padding: 16px 0;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    color: #111827;
    font-size: 16px;
    font-weight: 500;
    text-align: left;

    &:hover {
      color: #3b82f6;
    }

    &:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  `,

  icon: css<{ isOpen: boolean }>`
    transition: transform 0.2s ease;
    transform: ${(props) => (props.isOpen ? 'rotate(180deg)' : 'rotate(0)')};
    margin-left: 12px;
    flex-shrink: 0;
    color: #6b7280;
  `,

  content: css<{ isOpen: boolean; height: number }>`
    overflow: hidden;
    transition: max-height 0.3s ease;
    max-height: ${(props) => (props.isOpen ? `${props.height}px` : '0')};
  `,

  contentInner: css`
    padding-bottom: 16px;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  `,
};

interface AccordionItem {
  id: string | number;
  title: string;
  content: string | (() => JSX.Element);
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpenIds?: (string | number)[];
}

export const Accordion = defineComponent({
  name: 'Accordion',
  props: {
    items: {
      type: Array as PropType<AccordionItem[]>,
      required: true,
    },
    multiple: Boolean,
    defaultOpenIds: {
      type: Array as PropType<(string | number)[]>,
      default: () => [],
    },
  },
  setup(props) {
    const openIds = ref<Set<string | number>>(new Set(props.defaultOpenIds));
    const contentHeights = ref<Record<string | number, number>>({});

    const isItemOpen = (id: string | number) => {
      return openIds.value.has(id);
    };

    const toggleItem = (id: string | number) => {
      const item = props.items.find((item) => item.id === id);
      if (item?.disabled) return;

      if (props.multiple) {
        const newOpenIds = new Set(openIds.value);
        if (newOpenIds.has(id)) {
          newOpenIds.delete(id);
        } else {
          newOpenIds.add(id);
        }
        openIds.value = newOpenIds;
      } else {
        openIds.value = openIds.value.has(id) ? new Set() : new Set([id]);
      }
    };

    const setContentHeight = (id: string | number, height: number) => {
      contentHeights.value[id] = height;
    };

    return {
      openIds,
      contentHeights,
      isItemOpen,
      toggleItem,
      setContentHeight,
    };
  },
  render() {
    return (
      <div class={styles.accordion}>
        {this.items.map((item) => {
          const isOpen = this.isItemOpen(item.id);
          const height = this.contentHeights[item.id] || 0;

          return (
            <div key={item.id} class={styles.item}>
              <h3>
                <button
                  class={styles.trigger({ isOpen })}
                  onClick={() => this.toggleItem(item.id)}
                  disabled={item.disabled}
                  aria-expanded={isOpen}
                  aria-controls={`accordion-content-${item.id}`}
                >
                  <span>{item.title}</span>
                  <div class={styles.icon({ isOpen })}>
                    <i class="fas fa-chevron-down" />
                  </div>
                </button>
              </h3>

              <div
                id={`accordion-content-${item.id}`}
                class={styles.content({ isOpen, height })}
                aria-hidden={!isOpen}
              >
                <div
                  class={styles.contentInner}
                  ref={(el: HTMLElement) => {
                    if (el && !this.contentHeights[item.id]) {
                      this.setContentHeight(item.id, el.scrollHeight);
                    }
                  }}
                >
                  {typeof item.content === 'function'
                    ? item.content()
                    : item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
});
