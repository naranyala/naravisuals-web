import clsx from 'clsx';
import { css } from 'goober';
import { computed, defineComponent, type PropType, ref } from 'vue';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

interface StepperProps {
  steps: Step[];
  modelValue: number;
  orientation?: 'horizontal' | 'vertical';
  showIcons?: boolean;
  className?: string;
}

const styles = {
  stepper: css`
    display: flex;
    gap: 1rem;
    padding: 1rem;
  `,

  horizontal: css`
    flex-direction: row;
    align-items: flex-start;
  `,

  vertical: css`
    flex-direction: column;
    align-items: stretch;
  `,

  step: css`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    position: relative;
  `,

  stepConnector: css`
    position: absolute;
    top: 1.25rem;
    left: 2.5rem;
    right: -1rem;
    height: 2px;
    background: #e5e7eb;

    &.completed {
      background: #10b981;
    }

    &.vertical {
      position: absolute;
      top: 2.5rem;
      left: 1.25rem;
      right: auto;
      width: 2px;
      height: calc(100% - 1rem);
    }
  `,

  stepIndicator: css`
    position: relative;
    z-index: 1;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &.pending {
      background: #f3f4f6;
      color: #9ca3af;
      border: 2px solid #e5e7eb;
    }

    &.current {
      background: #3b82f6;
      color: white;
      border: 2px solid #3b82f6;
    }

    &.completed {
      background: #10b981;
      color: white;
      border: 2px solid #10b981;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  stepContent: css`
    flex: 1;
  `,

  stepTitle: css`
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.25rem;

    &.completed {
      color: #10b981;
    }

    &.current {
      color: #3b82f6;
    }
  `,

  stepDescription: css`
    font-size: 0.875rem;
    color: #6b7280;
  `,

  content: css`
    margin-top: 2rem;
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  `,

  navigation: css`
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  `,

  navButton: css`
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    color: #374151;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.primary {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;

      &:hover:not(:disabled) {
        background: #2563eb;
        border-color: #2563eb;
      }
    }
  `,
};

export default defineComponent({
  name: 'Stepper',

  props: {
    steps: {
      type: Array as PropType<Step[]>,
      required: true,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    orientation: {
      type: String as PropType<StepperProps['orientation']>,
      default: 'horizontal',
    },
    showIcons: {
      type: Boolean,
      default: true,
    },
    className: String,
  },

  emits: ['update:modelValue', 'step-change'],

  setup(props, { emit, slots }) {
    const currentStep = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (newValue) => {
        currentStep.value = newValue;
      },
    );

    const isStepCompleted = (index: number) => {
      return index < currentStep.value;
    };

    const isStepCurrent = (index: number) => {
      return index === currentStep.value;
    };

    const isStepDisabled = (index: number) => {
      return props.steps[index]?.disabled || false;
    };

    const getStepStatus = (index: number) => {
      if (isStepCompleted(index)) return 'completed';
      if (isStepCurrent(index)) return 'current';
      return 'pending';
    };

    const goToStep = (index: number) => {
      if (isStepDisabled(index)) return;

      currentStep.value = index;
      emit('update:modelValue', index);
      emit('step-change', index, props.steps[index]);
    };

    const nextStep = () => {
      if (currentStep.value < props.steps.length - 1) {
        goToStep(currentStep.value + 1);
      }
    };

    const prevStep = () => {
      if (currentStep.value > 0) {
        goToStep(currentStep.value - 1);
      }
    };

    const canGoNext = computed(() => {
      return currentStep.value < props.steps.length - 1;
    });

    const canGoPrev = computed(() => {
      return currentStep.value > 0;
    });

    return () => (
      <div
        class={clsx(styles.stepper, styles[props.orientation], props.className)}
      >
        {props.steps.map((step, index) => (
          <div key={step.id} class={styles.step}>
            <div
              class={clsx(
                styles.stepIndicator,
                styles[getStepStatus(index)],
                isStepDisabled(index) && 'disabled',
              )}
              onClick={() => goToStep(index)}
            >
              {props.showIcons && step.icon ? step.icon : index + 1}
            </div>

            {index < props.steps.length - 1 && (
              <div
                class={clsx(
                  styles.stepConnector,
                  props.orientation === 'vertical' && 'vertical',
                  isStepCompleted(index + 1) && 'completed',
                )}
              />
            )}

            <div class={styles.stepContent}>
              <div class={clsx(styles.stepTitle, styles[getStepStatus(index)])}>
                {step.title}
              </div>
              {step.description && (
                <div class={styles.stepDescription}>{step.description}</div>
              )}
            </div>
          </div>
        ))}

        {slots.content && (
          <div class={styles.content}>
            {slots.content({
              step: props.steps[currentStep.value],
              index: currentStep.value,
            })}
          </div>
        )}

        {slots.navigation && (
          <div class={styles.navigation}>
            {slots.navigation({
              next: nextStep,
              prev: prevStep,
              canNext: canGoNext.value,
              canPrev: canGoPrev.value,
              currentStep: currentStep.value,
              totalSteps: props.steps.length,
            })}
          </div>
        )}
      </div>
    );
  },
});
