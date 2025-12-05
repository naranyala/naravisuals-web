<script setup>
const dropdown = ref(null)
const [clickedOutside, { bind }] = useClickOutside()
onMounted(() => bind(dropdown.value))

watch(clickedOutside, (out) => out && (isOpen.value = false))
</script>

<template>
  <div ref="dropdown">Dropdown content</div>
</template>
