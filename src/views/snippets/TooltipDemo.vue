<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
const props = defineProps<{
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>()

const tooltip = ref<HTMLElement>()
let popper: any

onMounted(async () => {
  const { createPopper } = await import('@popperjs/core')
  popper = createPopper(tooltip.value!.previousElementSibling!, tooltip.value!, {
    placement: props.position || 'top',
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
  })
})
onBeforeUnmount(() => popper?.destroy())
</script>

<template>
  <slot />
  <div ref="tooltip" class="tooltip">{{ text }}</div>
</template>

<style scoped>
.tooltip {
  background: #333;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}
slot:hover + .tooltip,
*:hover > .tooltip {
  opacity: 1;
}
.tooltip::after {
  content: '';
  position: absolute;
  border: 5px solid transparent;
}
[data-popper-placement^='top'] > .tooltip::after {
  bottom: -5px; border-top-color: #333;
}
</style>
