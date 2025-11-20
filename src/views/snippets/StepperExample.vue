<template>
  <div class="stepper">
    <!-- Steps Header -->
    <div class="stepper-header">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-indicator"
        :class="getStepClass(step.id, index)"
      >
        <div class="step-number">
          <span v-if="!isStepCompleted(step.id)">{{ index + 1 }}</span>
          <span v-else>✓</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
        <div
          v-if="index < steps.length - 1"
          class="step-connector"
          :class="{ active: isStepCompleted(step.id) }"
        ></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="stepper-content">
      <slot :name="`step-${currentStep}`" :step="currentStepData">
        <div class="step-default-content">
          <h3>{{ currentStepData?.label }}</h3>
          <p>{{ currentStepData?.description }}</p>
        </div>
      </slot>
    </div>

    <!-- Navigation -->
    <div class="stepper-actions">
      <button
        v-if="currentStepIndex > 0"
        @click="goToPrevious"
        class="btn-secondary"
      >
        Previous
      </button>
      
      <button
        v-if="currentStepIndex < steps.length - 1"
        @click="goToNext"
        :disabled="!canProceed"
        class="btn-primary"
      >
        Next
      </button>
      
      <button
        v-else
        @click="complete"
        :disabled="!canComplete"
        class="btn-primary"
      >
        Complete
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true,
    validator: (steps) => steps.every(step => step.id && step.label)
  },
  currentStep: {
    type: String,
    default: null
  },
  canProceed: {
    type: Boolean,
    default: true
  },
  canComplete: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:currentStep',
  'step-change',
  'previous',
  'next',
  'complete'
])

const internalCurrentStep = ref(props.currentStep || props.steps[0]?.id)

const currentStepIndex = computed(() => 
  props.steps.findIndex(step => step.id === internalCurrentStep.value)
)

const currentStepData = computed(() => 
  props.steps.find(step => step.id === internalCurrentStep.value)
)

const completedSteps = ref(new Set())

const getStepClass = (stepId, index) => {
  const isCurrent = stepId === internalCurrentStep.value
  const isCompleted = completedSteps.value.has(stepId)
  const isPast = index < currentStepIndex.value
  
  return {
    current: isCurrent,
    completed: isCompleted,
    past: isPast,
    future: index > currentStepIndex.value
  }
}

const isStepCompleted = (stepId) => completedSteps.value.has(stepId)

const goToPrevious = () => {
  if (currentStepIndex.value > 0) {
    const previousStep = props.steps[currentStepIndex.value - 1]
    internalCurrentStep.value = previousStep.id
    emit('update:currentStep', previousStep.id)
    emit('step-change', { from: currentStepData.value, to: previousStep })
    emit('previous', previousStep)
  }
}

const goToNext = () => {
  if (props.canProceed && currentStepIndex.value < props.steps.length - 1) {
    completedSteps.value.add(internalCurrentStep.value)
    const nextStep = props.steps[currentStepIndex.value + 1]
    internalCurrentStep.value = nextStep.id
    emit('update:currentStep', nextStep.id)
    emit('step-change', { from: currentStepData.value, to: nextStep })
    emit('next', nextStep)
  }
}

const complete = () => {
  if (props.canComplete) {
    completedSteps.value.add(internalCurrentStep.value)
    emit('complete', internalCurrentStep.value)
  }
}

// Methods to control stepper from parent
const setStep = (stepId) => {
  const step = props.steps.find(s => s.id === stepId)
  if (step) {
    internalCurrentStep.value = stepId
    emit('update:currentStep', stepId)
    emit('step-change', { to: step })
  }
}

const markStepCompleted = (stepId) => {
  completedSteps.value.add(stepId)
}

defineExpose({
  setStep,
  markStepCompleted,
  goToPrevious,
  goToNext,
  complete
})
</script>

<style scoped>
.stepper {
  width: 100%;
}

.stepper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
}

.step-indicator {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid #d1d5db;
  background: white;
  color: #6b7280;
  z-index: 2;
  transition: all 0.3s ease;
}

.step-indicator.current .step-number {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.step-indicator.completed .step-number {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.step-indicator.past .step-number {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.step-label {
  margin-left: 8px;
  font-size: 14px;
  color: #6b7280;
  transition: color 0.3s ease;
}

.step-indicator.current .step-label {
  color: #3b82f6;
  font-weight: 500;
}

.step-indicator.completed .step-label {
  color: #10b981;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #d1d5db;
  margin: 0 8px;
  transition: background 0.3s ease;
}

.step-connector.active {
  background: #10b981;
}

.stepper-content {
  margin: 32px 0;
  min-height: 200px;
}

.step-default-content {
  text-align: center;
  padding: 40px 20px;
}

.stepper-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>
