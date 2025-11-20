<script setup lang="ts">
const props = defineProps<{
  loadMore: () => Promise<void>
  hasMore: boolean
}>()

const sentinel = ref<HTMLElement>()
onMounted(() => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && props.hasMore) props.loadMore()
  })
  observer.observe(sentinel.value!)
})
</script>

<template>
  <div>
    <slot />
    <div v-if="hasMore" ref="sentinel" class="infinite-sentinel">
      <LoadingSpinner />
    </div>
    <p v-else>No more items</p>
  </div>
</template>

<style scoped>
.infinite-sentinel { height: 50px; display: grid; place-items: center; }
</style>
