// src/components/Tooltip.tsx

import clsx from 'clsx';
import { css } from 'goober';
import {
  defineComponent,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
} from 'vue';

const styles = {
  container: css`
    display: inline-flex;
    position: relative;
  `,

  tooltip: css<{
    position: 'top' | 'bottom' | 'left' | 'right';
    visible: boolean;
  }>`
    position: absolute;
    z-index: 1000;
    padding: 8px 12px;
    background-color: #1f2937;
    color: white;
    border-radius: 6px;
    font-size: 14px;
    white-space: nowrap;
    pointer-events: none;
    opacity: ${(props) => (props.visible ? 1 : 0)};
    transform: ${(props) => (props.visible ? 'scale(1)' : 'scale(0.95)')};
    transition: opacity 0.2s ease, transform 0.2s ease;

    ${(props) => {
      switch (props.position) {
        case 'top':
          return `
            bottom: 100%;
            left: 50%;
            transform-origin: bottom center;
            margin-bottom: 8px;
            transform: translateX(-50%) ${props.visible ? 'scale(1)' : 'scale(0.95)'};
          `;
        case 'bottom':
          return `
            top: 100%;
            left: 50%;
            transform-origin: top center;
            margin-top: 8px;
            transform: translateX(-50%) ${props.visible ? 'scale(1)' : 'scale(0.95)'};
          `;
        case 'left':
          return `
            right: 100%;
            top: 50%;
            transform-origin: right center;
            margin-right: 8px;
            transform: translateY(-50%) ${props.visible ? 'scale(1)' : 'scale(0.95)'};
          `;
        case 'right':
          return `
            left: 100%;
            top: 50%;
            transform-origin: left center;
            margin-left: 8px;
            transform: translateY(-50%) ${props.visible ? 'scale(1)' : 'scale(0.95)'};
          `;
      }
    }}

    &::before {
      content: '';
      position: absolute;
      border: 6px solid transparent;

      ${(props) => {
        switch (props.position) {
          case 'top':
            return `
              top: 100%;
              left: 50%;
              border-top-color: #1f2937;
              transform: translateX(-50%);
            `;
          case 'bottom':
            return `
              bottom: 100%;
              left: 50%;
              border-bottom-color: #1f2937;
              transform: translateX(-50%);
            `;
          case 'left':
            return `
              left: 100%;
              top: 50%;
              border-left-color: #1f2937;
              transform: translateY(-50%);
            `;
          case 'right':
            return `
              right: 100%;
              top: 50%;
              border-right-color: #1f2937;
              transform: translateY(-50%);
            `;
        }
      }}
    }
  `,

  content: css`
    max-width: 200px;
    text-align: center;
  `,
};

interface TooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

export const Tooltip = defineComponent({
  name: 'Tooltip',
  props: {
    text: {
      type: String,
      required: true,
    },
    position: {
      type: String as PropType<TooltipProps['position']>,
      default: 'top',
    },
    delay: {
      type: Number,
      default: 300,
    },
    disabled: Boolean,
  },
  setup(props) {
    const isVisible = ref(false);
    let timeoutId: number | null = null;
    let leaveTimeoutId: number | null = null;

    const showTooltip = () => {
      if (props.disabled) return;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        isVisible.value = true;
      }, props.delay);
    };

    const hideTooltip = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (leaveTimeoutId) {
        clearTimeout(leaveTimeoutId);
      }

      leaveTimeoutId = window.setTimeout(() => {
        isVisible.value = false;
      }, 150);
    };

    const clearTimeouts = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (leaveTimeoutId) clearTimeout(leaveTimeoutId);
    };

    onUnmounted(() => {
      clearTimeouts();
    });

    return {
      isVisible,
      showTooltip,
      hideTooltip,
      clearTimeouts,
    };
  },
  render() {
    return (
      <div
        class={styles.container}
        onMouseenter={this.showTooltip}
        onMouseleave={this.hideTooltip}
        onFocus={this.showTooltip}
        onBlur={this.hideTooltip}
      >
        {this.$slots.default?.()}

        <div
          class={styles.tooltip({
            position: this.position,
            visible: this.isVisible,
          })}
          role="tooltip"
          aria-hidden={!this.isVisible}
        >
          <div class={styles.content}>{this.text}</div>
        </div>
      </div>
    );
  },
});
