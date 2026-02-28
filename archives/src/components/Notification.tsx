import clsx from 'clsx';
import { css, keyframes } from 'goober';
import { defineComponent, onMounted, onUnmounted, type PropType } from 'vue';

const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const styles = {
  notification: css`
    position: fixed;
    top: 1rem;
    right: 1rem;
    max-width: 400px;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    z-index: 1000;
    animation: ${slideInRight} 0.3s ease-out;

    &.exiting {
      animation: ${slideOutRight} 0.3s ease-in forwards;
    }
  `,

  icon: css`
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
  `,

  content: css`
    flex: 1;
  `,

  title: css`
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.25rem;
  `,

  message: css`
    color: #6b7280;
    font-size: 0.875rem;
  `,

  closeButton: css`
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  `,

  variants: {
    success: css`
      border-left: 4px solid #10b981;
    `,
    error: css`
      border-left: 4px solid #ef4444;
    `,
    warning: css`
      border-left: 4px solid #f59e0b;
    `,
    info: css`
      border-left: 4px solid #3b82f6;
    `,
  },

  icons: {
    success: css`background: #10b981;`,
    error: css`background: #ef4444;`,
    warning: css`background: #f59e0b;`,
    info: css`background: #3b82f6;`,
  },
};

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  className?: string;
}

export default defineComponent({
  name: 'Notification',

  props: {
    type: {
      type: String as PropType<NotificationProps['type']>,
      default: 'info',
    },
    title: String,
    message: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 5000,
    },
    closable: {
      type: Boolean,
      default: true,
    },
    className: String,
  },

  emits: ['close'],

  setup(props, { emit }) {
    const isExiting = ref(false);
    let timeoutId: number | null = null;

    const handleClose = () => {
      isExiting.value = true;
      setTimeout(() => {
        emit('close');
      }, 300);
    };

    onMounted(() => {
      if (props.duration > 0) {
        timeoutId = setTimeout(handleClose, props.duration);
      }
    });

    onUnmounted(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '!',
      info: 'i',
    };

    return () => (
      <div
        class={clsx(
          styles.notification,
          styles.variants[props.type],
          isExiting.value && 'exiting',
          props.className,
        )}
      >
        <div class={clsx(styles.icon, styles.icons[props.type])}>
          {iconMap[props.type]}
        </div>

        <div class={styles.content}>
          {props.title && <div class={styles.title}>{props.title}</div>}
          <div class={styles.message}>{props.message}</div>
        </div>

        {props.closable && (
          <button class={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        )}
      </div>
    );
  },
});
