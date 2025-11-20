<script setup lang="ts">
import { ref } from 'vue'
const model = defineModel<Date | null>({ default: null })
const open = ref(false)
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth())

const days = computed(() => {
  const start = new Date(year.value, month.value, 1).getDay()
  const length = new Date(year.value, month.value + 1, 0).getDate()
  return { start, length }
})
</script>

<template>
  <div class="date-picker">
    <input :value="model?.toLocaleDateString()" readonly @click="open = true" placeholder="Pick a date" />
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="open" class="datepicker-popper" @click.stop>
          <!-- calendar grid here -->
          <button @click="open = false">Close</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
