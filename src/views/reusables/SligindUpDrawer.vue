<template>
  <Teleport to="body">
  <Transition name="slide">
    <div v-if="modelValue" class="drawer-backdrop" @click="close" role="dialog" aria-modal="true" :aria-labelledby="titleId">

      <div class="drawer" @click.stop>
        
        <div v-if="$slots.header" class="drawer-header" :id="titleId">
          <slot name="header" />
          <button @click="close" class="close-btn" aria-label="Close drawer">
            &times;
          </button>
        </div>
        
        <!-- <div class="drawer-handle"></div> -->

        <div class="drawer-content">
          <slot />
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  // Controls the visibility of the drawer (v-model)
  modelValue: {
    type: Boolean,
    required: true
  },
  // Allows the user to disable closing the drawer by clicking the backdrop
  persistent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// Unique ID for ARIA-labelledby
const titleId = ref('drawer-title-' + Math.random().toString(36).substring(2, 9))

// --- Closing Logic ---

const close = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
  }
}

// Handle closing with the 'Escape' key
const handleKeyup = (event) => {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

// Watch for visibility changes to add/remove the keyup listener
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    document.addEventListener('keyup', handleKeyup)
    // Optional: Add a class to body to prevent background scrolling
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keyup', handleKeyup)
    document.body.style.overflow = ''
  }
}, { immediate: true }) // Run on first render to set up initial state
</script>

<style scoped>
/*
  1. Base Structure & Positioning
*/
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  color: #f0f0f0;
}

.drawer {
  margin-top: auto;
  background: #2c2c2c;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  max-height: 90vh;
  box-shadow: 0 -5px 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
}

/*
  2. Handle and Header
*/
.drawer-handle {
  width: 40px;
  height: 5px;
  background: #666;
  border-radius: 3px;
  margin: 10px auto;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 0;
  border-bottom: 1px solid #444;
}

.close-btn {
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  color: #f0f0f0;
}

/*
  3. Content Area
*/
.drawer-content {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
  min-height: 0;
}

/*
  4. Slide & Fade Animation (The Magic)
*/

/* Active State: Apply a smooth transition to both transform (drawer) and opacity (backdrop) */
.slide-enter-active,
.slide-leave-active {
  /* Transition for backdrop opacity */
  transition: opacity 0.3s ease-out; 
}

/* The Drawer element (child of backdrop) should use a dedicated transform transition */
.slide-enter-active .drawer,
.slide-leave-active .drawer {
  /* Transition for drawer slide */
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1); 
}

/* Initial/Exit State: Make the entire backdrop invisible */
.slide-enter-from,
.slide-leave-to {
  opacity: 0; /* Fades the backdrop in/out */
}

/* Initial/Exit State for the inner drawer: Slide it off-screen */
.slide-enter-from .drawer,
.slide-leave-to .drawer {
  transform: translateY(100%); /* Slides the drawer off-screen */
}

/* Final/Entry State: Ensure opacity is 1 and transform is reset */
.slide-enter-to,
.slide-leave-from {
  opacity: 1; /* Backdrop fully visible */
}

.slide-enter-to .drawer,
.slide-leave-from .drawer {
  transform: translateY(0); /* Drawer fully visible */
}
</style>
