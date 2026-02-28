// CollapsibleSection.vue (in JSX)

import { clsx } from 'clsx';
import { css } from 'goober';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'CollapsibleSection',

  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    badge: {
      type: [String, Number],
      default: null,
    },
    defaultOpen: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '▶', // Default arrow icon
    },
    openIcon: {
      type: String,
      default: '▼', // Arrow when open
    },
  },

  setup(props, { slots }) {
    const isOpen = ref(props.defaultOpen);

    const toggle = () => {
      isOpen.value = !isOpen.value;
    };

    return () => (
      <div class={styles.section}>
        {/* Header */}
        <div
          class={clsx(styles.header, isOpen.value && styles.headerOpen)}
          onClick={toggle}
        >
          <div class={styles.titleContainer}>
            <span class={clsx(styles.icon, isOpen.value && styles.iconOpen)}>
              {isOpen.value ? props.openIcon : props.icon}
            </span>
            <div>
              <h3 class={styles.title}>
                {props.title}
                {props.badge && <span class={styles.badge}>{props.badge}</span>}
              </h3>
              {props.subtitle && (
                <p class={styles.subtitle}>{props.subtitle}</p>
              )}
            </div>
          </div>

          {/* Optional header slot for additional content */}
          {slots.header && slots.header()}
        </div>

        {/* Content with animation */}
        <div
          class={styles.content}
          style={{
            maxHeight: isOpen.value ? '5000px' : '0',
            opacity: isOpen.value ? '1' : '0',
          }}
        >
          <div class={styles.contentInner}>
            {/* Default slot for main content */}
            {slots.default && slots.default()}

            {/* Optional footer slot */}
            {slots.footer && (
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {slots.footer()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
});

// Define styles
const styles = {
  section: css`
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
    margin: 16px 0;
    transition: all 0.3s ease;
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    cursor: pointer;
    user-select: none;
    background: rgba(255, 255, 255, 0.03);
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  `,
  headerOpen: css`
    background: rgba(100, 180, 255, 0.05);
    border-bottom: 1px solid rgba(100, 180, 255, 0.1);
  `,
  titleContainer: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
  icon: css`
    color: #64b4ff;
    font-size: 20px;
    transition: transform 0.3s ease;
  `,
  iconOpen: css`
    transform: rotate(60deg);
  `,
  title: css`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #e6f0ff;
  `,
  subtitle: css`
    margin: 0;
    font-size: 14px;
    color: rgba(230, 240, 255, 0.6);
  `,
  badge: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    background: rgba(100, 180, 255, 0.15);
    color: #64b4ff;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-left: 8px;
  `,
  content: css`
    overflow: hidden;
    transition: all 0.3s ease;
  `,
  contentInner: css`
    padding: 20px;
  `,
};
