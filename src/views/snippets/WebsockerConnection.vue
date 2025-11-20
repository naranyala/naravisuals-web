
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
});

const socket = ref(null);
const messages = ref([]);

onMounted(() => {
  socket.value = new WebSocket(props.url);
  socket.value.onmessage = (event) => {
    messages.value.push(event.data);
  };
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});
</script>

<template>
  <div>
    <div v-for="(message, index) in messages" :key="index">
      {{ message }}
    </div>
  </div>
</template>
