
<template>
  <img :src="observerLoaded ? src : placeholder" @load="loaded = true" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  placeholder: { type: String, default: '' }
})

const loaded = ref(false)
const observerLoaded = ref(false)

onMounted(() => {
  const el = document.querySelector('img')
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      observerLoaded.value = true
      observer.disconnect()
    }
  })
  observer.observe(el)
})
</script>
