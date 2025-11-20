
<script setup>
import { ref, onMounted } from 'vue';

const canvasRef = ref(null);
let ctx = null;
let isDrawing = false;

const startDrawing = (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
};

const draw = (e) => {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

const stopDrawing = () => {
  isDrawing = false;
};

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
});
</script>

<template>
  <canvas
    ref="canvasRef"
    width="500"
    height="500"
    @mousedown="startDrawing"
    @mousemove="draw"
    @mouseup="stopDrawing"
    @mouseleave="stopDrawing"
  ></canvas>
</template>
