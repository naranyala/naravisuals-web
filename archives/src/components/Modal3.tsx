// src/components/Modal.tsx

import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent, onMounted, onUnmounted, type PropType } from 'vue';

const styles = {
  overlay: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  `,

  modal: css<{ size: 'sm' | 'md' | 'lg' | 'xl' }>`
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: slideIn 0.3s ease;
    width: ${(props) => {
      switch (props.size) {
        case 'sm':
          return '400px';
        case 'md':
          return '500px';
        case 'lg':
          return '600px';
        case 'xl':
          return '800px';
      }
    }};
    max-width: 95vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  `,

  header: css`
    padding: 20px 24px 0;
    flex-shrink: 0;
  `,

  title: css`
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px;
  `,

  closeButton: css`
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;

    &:hover {
      background-color: #f3f4f6;
      color: #374151;
    }
  `,

  content: css`
    padding: 20px 24px;
    flex: 1;
    overflow-y: auto;
  `,

  footer: css`
    padding: 0 24px 20px;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  `,

  '@keyframes fadeIn': css`
    from { opacity: 0; }
    to { opacity: 1; }
  `,

  '@keyframes slideIn': css`
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  `,
};

interface ModalProps {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  onClose: () => void;
}

export const Modal = defineComponent({
  name: 'Modal',
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    title: String,
    size: {
      type: String as PropType<ModalProps['size']>,
      default: 'md',
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true,
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
    onClose: {
      type: Function as PropType<ModalProps['onClose']>,
      required: true,
    },
  },
  setup(props) {
    const handleOverlayClick = (event: MouseEvent) => {
      if (
        props.closeOnOverlayClick &&
        (event.target as HTMLElement).classList.contains('modal-overlay')
      ) {
        props.onClose();
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && props.isOpen) {
        props.onClose();
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown);
    });

    return {
      handleOverlayClick,
    };
  },
  render() {
    if (!this.isOpen) return null;

    return (
      <div class={styles.overlay} onClick={this.handleOverlayClick}>
        <div class={styles.modal({ size: this.size })}>
          <div class={styles.header}>
            {this.title && <h2 class={styles.title}>{this.title}</h2>}
            {this.showCloseButton && (
              <button
                class={styles.closeButton}
                onClick={this.onClose}
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <div class={styles.content}>{this.$slots.default?.()}</div>

          {this.$slots.footer && (
            <div class={styles.footer}>{this.$slots.footer()}</div>
          )}
        </div>
      </div>
    );
  },
});
