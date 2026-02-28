import clsx from 'clsx';
import { css, keyframes } from 'goober';
import { defineComponent, onMounted, onUnmounted, type PropType } from 'vue';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const styles = {
  overlay: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.2s ease-out;
  `,

  modal: css`
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    animation: ${slideUp} 0.3s ease-out;
  `,

  sizes: {
    sm: css`width: 400px;`,
    md: css`width: 500px;`,
    lg: css`width: 700px;`,
    xl: css`width: 900px;`,
  },

  header: css`
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,

  title: css`
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  `,

  closeButton: css`
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  `,

  body: css`
    padding: 1.5rem;
  `,

  footer: css`
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  `,
};

interface ModalProps {
  modelValue: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  className?: string;
}

export default defineComponent({
  name: 'Modal',

  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: String,
    size: {
      type: String as PropType<ModalProps['size']>,
      default: 'md',
    },
    closable: {
      type: Boolean,
      default: true,
    },
    className: String,
  },

  emits: ['update:modelValue', 'close'],

  setup(props, { emit, slots }) {
    const handleClose = () => {
      emit('update:modelValue', false);
      emit('close');
    };

    const handleOverlayClick = (e: Event) => {
      if (props.closable && e.target === e.currentTarget) {
        handleClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.closable) {
        handleClose();
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    });

    return () =>
      props.modelValue ? (
        <div class={styles.overlay} onClick={handleOverlayClick}>
          <div
            class={clsx(
              styles.modal,
              styles.sizes[props.size!],
              props.className,
            )}
          >
            {(props.title || slots.header || props.closable) && (
              <div class={styles.header}>
                {slots.header
                  ? slots.header()
                  : props.title && <h2 class={styles.title}>{props.title}</h2>}
                {props.closable && (
                  <button class={styles.closeButton} onClick={handleClose}>
                    ×
                  </button>
                )}
              </div>
            )}

            <div class={styles.body}>{slots.default?.()}</div>

            {slots.footer && <div class={styles.footer}>{slots.footer()}</div>}
          </div>
        </div>
      ) : null;
  },
});
