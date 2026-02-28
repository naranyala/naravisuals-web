import clsx from 'clsx';
import { css, keyframes } from 'goober';
import { defineComponent, type PropType, ref } from 'vue';

interface AccordionItem {
  key: string;
  title: string;
  content: any;
  disabled?: boolean;
}

const rotateDown = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(180deg); }
`;

const rotateUp = keyframes`
  from { transform: rotate(180deg); }
  to { transform: rotate(0deg); }
`;

const styles = {
  container: css`
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  `,

  item: css`
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      border-bottom: none;
    }
  `,

  header: css`
    width: 100%;
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    text-align: left;
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: #f9fafb;
    }

    &:focus {
      outline: none;
      box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  `,

  activeHeader: css`
    background: #f3f4f6;
    color: #111827;
  `,

  disabledHeader: css`
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: none;
    }
  `,

  icon: css`
    font-size: 1.25rem;
    transition: transform 0.2s ease;
  `,

  rotateDown: css`
    animation: ${rotateDown} 0.2s ease-out forwards;
  `,

  rotateUp: css`
    animation: ${rotateUp} 0.2s ease-out forwards;
  `,

  content: css`
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
    background: white;
  `,

  contentInner: css`
    padding: 1rem 1.5rem;
  `,

  activeContent: css`
    max-height: 500px;
    transition: max-height 0.3s ease-in;
  `,
};

interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  className?: string;
}

export default defineComponent({
  name: 'Accordion',

  props: {
    items: {
      type: Array as PropType<AccordionItem[]>,
      required: true,
    },
    multiple: Boolean,
    className: String,
  },

  setup(props) {
    const activeKeys = ref<string[]>([]);

    const toggleItem = (key: string) => {
      if (activeKeys.value.includes(key)) {
        activeKeys.value = activeKeys.value.filter((k) => k !== key);
      } else {
        if (props.multiple) {
          activeKeys.value.push(key);
        } else {
          activeKeys.value = [key];
        }
      }
    };

    return () => (
      <div class={clsx(styles.container, props.className)}>
        {props.items.map((item) => {
          const isActive = activeKeys.value.includes(item.key);

          return (
            <div key={item.key} class={styles.item}>
              <button
                class={clsx(
                  styles.header,
                  isActive && styles.activeHeader,
                  item.disabled && styles.disabledHeader,
                )}
                onClick={() => !item.disabled && toggleItem(item.key)}
                disabled={item.disabled}
              >
                <span>{item.title}</span>
                <span
                  class={clsx(
                    styles.icon,
                    isActive ? styles.rotateDown : styles.rotateUp,
                  )}
                >
                  ▼
                </span>
              </button>

              <div
                class={clsx(styles.content, isActive && styles.activeContent)}
              >
                <div class={styles.contentInner}>{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
});
