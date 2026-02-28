// src/components/Alert.tsx

import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent, type PropType, ref } from 'vue';

const styles = {
  alert: css<{
    variant: 'info' | 'success' | 'warning' | 'danger';
    dismissible: boolean;
  }>`
    padding: 16px 20px;
    border-radius: 8px;
    border-left: 4px solid;
    margin-bottom: 16px;
    position: relative;
    display: flex;
    align-items: flex-start;

    ${(props) => {
      switch (props.variant) {
        case 'info':
          return `
            background-color: #eff6ff;
            border-left-color: #3b82f6;
            color: #1e40af;
          `;
        case 'success':
          return `
            background-color: #f0fdf4;
            border-left-color: #10b981;
            color: #065f46;
          `;
        case 'warning':
          return `
            background-color: #fef3c7;
            border-left-color: #f59e0b;
            color: #92400e;
          `;
        case 'danger':
          return `
            background-color: #fef2f2;
            border-left-color: #ef4444;
            color: #991b1b;
          `;
      }
    }}

    ${(props) => props.dismissible && 'padding-right: 48px;'}
  `,

  icon: css`
    margin-right: 12px;
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  `,

  content: css`
    flex: 1;
  `,

  title: css`
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 16px;
  `,

  message: css`
    font-size: 14px;
    line-height: 1.5;
  `,

  closeButton: css`
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    color: inherit;
    opacity: 0.7;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }
  `,
};

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  showIcon?: boolean;
}

const iconMap = {
  info: 'fas fa-info-circle',
  success: 'fas fa-check-circle',
  warning: 'fas fa-exclamation-triangle',
  danger: 'fas fa-exclamation-circle',
};

export const Alert = defineComponent({
  name: 'Alert',
  props: {
    variant: {
      type: String as PropType<AlertProps['variant']>,
      default: 'info',
    },
    title: String,
    message: String,
    dismissible: Boolean,
    onDismiss: Function as PropType<() => void>,
    showIcon: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const isVisible = ref(true);

    const handleDismiss = () => {
      isVisible.value = false;
      props.onDismiss?.();
    };

    return {
      isVisible,
      handleDismiss,
    };
  },
  render() {
    if (!this.isVisible) return null;

    const icon = iconMap[this.variant];

    return (
      <div
        class={styles.alert({
          variant: this.variant,
          dismissible: this.dismissible,
        })}
        role="alert"
      >
        {this.showIcon && icon && (
          <div class={styles.icon}>
            <i class={icon} />
          </div>
        )}

        <div class={styles.content}>
          {this.title && <div class={styles.title}>{this.title}</div>}

          {this.message ? (
            <div class={styles.message}>{this.message}</div>
          ) : (
            <div class={styles.message}>{this.$slots.default?.()}</div>
          )}
        </div>

        {this.dismissible && (
          <button
            class={styles.closeButton}
            onClick={this.handleDismiss}
            aria-label="Close alert"
          >
            <i class="fas fa-times" />
          </button>
        )}
      </div>
    );
  },
});
