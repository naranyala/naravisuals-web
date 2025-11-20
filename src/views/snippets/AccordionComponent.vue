<script setup>
const props = defineProps<{
  multiple?: boolean
  defaultOpen?: boolean
}>()

const isOpen = ref(props.defaultOpen ?? false)

const toggle = () => {
  if (!props.multiple) isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="accordion">
    <div class="accordion-header" @click="toggle">
      <slot name="title" />
      <span :class="{ rotated: isOpen }">▼</span>
    </div>
    <Transition name="accordion">
      <div v-if="isOpen" class="accordion-body">
        <slot />
      </div>
    </Transition>
  </div>
</template>
