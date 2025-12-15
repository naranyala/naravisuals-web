<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="close">
      <div class="modal">
        <button @click="close" class="close">×</button>
        <div class="content">
          <h2>{{ title }}</h2>
          <p>{{ content }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  open: Boolean,
  title: String,
  content: String
})

const emit = defineEmits(['close'])

const close = () => emit('close')
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
}

.content {
  padding: 30px;
}

h2 {
  margin: 0 0 15px 0;
}
</style>
