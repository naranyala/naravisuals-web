// src/components/ProgressBar.tsx
import { defineComponent, PropType, computed } from 'vue'
import { css } from "goober"
import clsx from "clsx"

const styles = {
  container: css<{ height: number }>`
    width: 100%;
    height: ${props => props.height}px;
    background-color: #e5e7eb;
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
  `,

  progress: css<{
    percentage: number
    color: string
    animated: boolean
    striped: boolean
    height: number
  }>`
    height: 100%;
    background-color: ${props => props.color};
    border-radius: 9999px;
    width: ${props => props.percentage}%;
    transition: width 0.3s ease;
    position: relative;

    ${props => props.animated && `
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-image: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.15) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.15) 50%,
          rgba(255, 255, 255, 0.15) 75%,
          transparent 75%,
          transparent
        );
        background-size: ${props.height}px ${props.height}px;
        animation: progressStripes 1s linear infinite;
      }
    `}
  `,

  label: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  `,

  '@keyframes progressStripes': css`
    0% { background-position: ${props => props.height}px 0; }
    100% { background-position: 0 0; }
  `
}

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | string
  height?: number
  showLabel?: boolean
  animated?: boolean
  striped?: boolean
  labelPosition?: 'inside' | 'outside'
}

const colorMap = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#0ea5e9'
}

export const ProgressBar = defineComponent({
  name: 'ProgressBar',
  props: {
    value: {
      type: Number,
      required: true,
      validator: (value: number) => value >= 0
    },
    max: {
      type: Number,
      default: 100
    },
    color: {
      type: String as PropType<ProgressBarProps['color']>,
      default: 'primary'
    },
    height: {
      type: Number,
      default: 8
    },
    showLabel: Boolean,
    animated: Boolean,
    striped: Boolean,
    labelPosition: {
      type: String as PropType<'inside' | 'outside'>,
      default: 'inside'
    }
  },
  setup(props) {
    const percentage = computed(() => {
      return Math.min(100, Math.max(0, (props.value / props.max) * 100))
    })

    const color = computed(() => {
      return colorMap[props.color as keyof typeof colorMap] || props.color
    })

    const labelText = computed(() => {
      return `${Math.round(percentage.value)}%`
    })

    return {
      percentage,
      color,
      labelText
    }
  },
  render() {
    const hasLabel = this.showLabel && this.labelText

    return (
      <div style="display: flex; align-items: center; gap: 12px; width: 100%">
        <div class={styles.container({ height: this.height })}>
          <div
            class={styles.progress({
              percentage: this.percentage,
              color: this.color,
              animated: this.animated,
              striped: this.striped,
              height: this.height
            })}
          />

          {hasLabel && this.labelPosition === 'inside' && (
            <div class={styles.label}>
              {this.labelText}
            </div>
          )}
        </div>

        {hasLabel && this.labelPosition === 'outside' && (
          <span style="font-size: 14px; color: #6b7280; min-width: 40px">
            {this.labelText}
          </span>
        )}
      </div>
    )
  }
})
