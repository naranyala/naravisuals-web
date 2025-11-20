<template>
  <div class="rating">
    <div class="rating-stars">
      <button
        v-for="star in maxStars"
        :key="star"
        :class="['star', { active: star <= modelValue, hover: star <= hoverRating }]"
        @click="setRating(star)"
        @mouseenter="hoverRating = star"
        @mouseleave="hoverRating = 0"
        :disabled="disabled"
      >
        <span class="star-icon">{{ getStarIcon(star) }}</span>
      </button>
    </div>
    
    <div v-if="showRatingValue" class="rating-value">
      {{ displayValue }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0
  },
  maxStars: {
    type: Number,
    default: 5
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showRatingValue: {
    type: Boolean,
    default: false
  },
  precision: {
    type: Number,
    default: 1
  },
  icon: {
    type: String,
    default: 'star',
    validator: (value) => ['star', 'heart', 'thumb'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const hoverRating = ref(0)

const displayValue = computed(() => {
  return props.modelValue.toFixed(props.precision)
})

const getStarIcon = (star) => {
  const icons = {
    star: star <= props.modelValue ? '★' : '☆',
    heart: star <= props.modelValue ? '❤️' : '🤍',
    thumb: star <= props.modelValue ? '👍' : '👆'
  }
  return icons[props.icon] || icons.star
}

const setRating = (rating) => {
  if (!props.disabled) {
    emit('update:modelValue', rating)
    emit('change', rating)
  }
}
</script>

<style scoped>
.rating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
  border-radius: 2px;
}

.star:not(:disabled):hover {
  transform: scale(1.2);
}

.star:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.star-icon {
  font-size: 24px;
  display: block;
  transition: all 0.2s ease;
}

.star:not(.active) .star-icon {
  color: #d1d5db;
}

.star.active .star-icon {
  color: #f59e0b;
}

.star.hover:not(.active) .star-icon {
  color: #fbbf24;
}

.rating-value {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  min-width: 30px;
}
</style>
