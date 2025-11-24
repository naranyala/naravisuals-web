
<template>
  <div>
    <!-- Trigger button -->
    <button @click="openGame">Play Snake</button>

    <!-- Modal overlay -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <canvas ref="canvas" width="400" height="400"></canvas>
        <button @click="closeGame">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const showModal = ref(false);
const canvas = ref(null);
let ctx;
let box = 20;
let snake = [];
let direction = "RIGHT";
let food;
let gameInterval;

function initGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  food = {
    x: Math.floor(Math.random() * (400 / box)) * box,
    y: Math.floor(Math.random() * (400 / box)) * box,
  };

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(draw, 100);
}

function draw() {
  ctx.clearRect(0, 0, 400, 400);

  // Snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "green" : "lime";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Movement
  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "UP") headY -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "DOWN") headY += box;

  // Collision
  if (
    headX < 0 || headY < 0 ||
    headX >= 400 || headY >= 400 ||
    snake.some(seg => seg.x === headX && seg.y === headY)
  ) {
    clearInterval(gameInterval);
    alert("Game Over!");
    initGame();
    return;
  }

  // Eat food
  let newHead = { x: headX, y: headY };
  if (headX === food.x && headY === food.y) {
    food = {
      x: Math.floor(Math.random() * (400 / box)) * box,
      y: Math.floor(Math.random() * (400 / box)) * box,
    };
  } else {
    snake.pop();
  }

  snake.unshift(newHead);
}

function handleKey(e) {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

function openGame() {
  showModal.value = true;
  initGame();
}

function closeGame() {
  showModal.value = false;
  clearInterval(gameInterval);
}

onMounted(() => {
  ctx = canvas.value.getContext("2d");
  window.addEventListener("keydown", handleKey);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKey);
  clearInterval(gameInterval);
});
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
canvas {
  background: #eee;
  display: block;
  margin: auto;
}
button {
  margin-top: 10px;
  padding: 6px 12px;
  cursor: pointer;
}
</style>
