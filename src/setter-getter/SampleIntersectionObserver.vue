<script setup>
const el = ref(null)
const [inView, { observe }] = useIntersectionObserver({ threshold: 0.1 })
onMounted(() => observe(el.value))
</script>

<template>
  <div ref="el" :class="{ 'animate-fade-in': inView }">Appears on scroll</div>
</template>
