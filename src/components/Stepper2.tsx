// src/components/Stepper.tsx
import { defineComponent, PropType, computed } from 'vue'
import { css } from "goober"
import clsx from "clsx"

const styles = {
  stepper: css`
    display: flex;
    justify-content: space-between;
    position: relative;
    counter-reset: step;

    &::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #e5e7eb;
      z-index: 1;
    }
  `,

  step: css<{
    isActive: boolean
    isCompleted: boolean
    isClickable: boolean
  }>`
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    cursor: ${props => props.isClickable ? 'pointer' : 'default'};

    &:not(:last-child) {
      margin-right: 8px;
    }
  `,

  stepIndicator: css<{
    isActive: boolean
    isCompleted: boolean
  }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${props =>
      props.isCompleted ? '#10b981' :
      props.isActive ? '#3b82f6' : '#e5e7eb'
    };
    color: ${props =>
      props.isCompleted || props.isActive ? 'white' : '#9ca3af'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-bottom: 8px;
    border: 3px solid white;
    transition: all 0.3s ease;

    &::before {
      counter-increment: step;
      content: ${props => props.isCompleted ? '"✓"' : 'counter(step)'};
    }
  `,

  stepLabel: css<{ isActive: boolean }>`
    font-size: 14px;
    font-weight: ${props => props.isActive ? 600 : 500};
    color: ${props => props.isActive ? '#111827' : '#6b7280'};
    text-align: center;
    max-width: 100px;
    line-height: 1.2;
  `,

  stepDescription: css`
    font-size: 12px;
    color: #9ca3af;
    margin-top: 2px;
    text-align: center;
    max-width: 100px;
  `,

  content: css`
    margin-top: 32px;
  `
}

interface Step {
  id: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface StepperProps {
  steps: Step[]
  activeStep: string | number
  onStepClick?: (stepId: string | number) => void
  showStepNumbers?: boolean
}

export const Stepper = defineComponent({
  name: 'Stepper',
  props: {
    steps: {
      type: Array as PropType<Step[]>,
      required: true
    },
    activeStep: {
      type: [String, Number],
      required: true
    },
    onStepClick: Function as PropType<(stepId: string | number) => void>,
    showStepNumbers: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const activeIndex = computed(() => {
      return props.steps.findIndex(step => step.id === props.activeStep)
    })

    const isStepActive = (stepId: string | number) => {
      return stepId === props.activeStep
    }

    const isStepCompleted = (stepIndex: number) => {
      return stepIndex < activeIndex.value
    }

    const handleStepClick = (step: Step, index: number) => {
      if (!step.disabled && index <= activeIndex.value + 1) {
        props.onStepClick?.(step.id)
      }
    }

    return {
      activeIndex,
      isStepActive,
      isStepCompleted,
      handleStepClick
    }
  },
  render() {
    return (
      <div>
        <div class={styles.stepper}>
          {this.steps.map((step, index) => {
            const isActive = this.isStepActive(step.id)
            const isCompleted = this.isStepCompleted(index)
            const isClickable = !step.disabled && index <= this.activeIndex + 1

            return (
              <div
                key={step.id}
                class={styles.step({
                  isActive,
                  isCompleted,
                  isClickable
                })}
                onClick={() => this.handleStepClick(step, index)}
                role="button"
                tabindex={isClickable ? 0 : -1}
                aria-label={`Step ${index + 1}: ${step.label}`}
                onKeydown={(e: KeyboardEvent) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    this.handleStepClick(step, index)
                  }
                }}
              >
                <div
                  class={styles.stepIndicator({
                    isActive,
                    isCompleted
                  })}
                />

                <div class={styles.stepLabel({ isActive })}>
                  {step.label}
                </div>

                {step.description && (
                  <div class={styles.stepDescription}>
                    {step.description}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div class={styles.content}>
          {this.$slots.default?.()}
        </div>
      </div>
    )
  }
})
