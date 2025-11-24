
<template>
  <div>
    <!-- Trigger button -->
    <button @click="openGame">Play Breakout</button>

    <!-- Modal overlay -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <canvas ref="canvas" width="480" height="320"></canvas>
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
let gameInterval;

// Ball
let ballRadius = 8;
let x, y, dx, dy;

// Paddle
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX;
let rightPressed = false;
let leftPressed = false;

// Bricks
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let bricks = [];

// Score
let score = 0;

function initGame() {
  x = canvas.value.width / 2;
  y = canvas.value.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.value.width - paddleWidth) / 2;
  score = 0;

  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(draw, 10);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.value.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x && x < b.x + brickWidth &&
          y > b.y && y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            alert("YOU WIN!");
            initGame();
          }
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText("Score: " + score, 8, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  // Bounce off walls
  if (x + dx > canvas.value.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.value.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      alert("GAME OVER");
      initGame();
    }
  }

  x += dx;
  y += dy;

  if (rightPressed && paddleX < canvas.value.width - paddleWidth) {
    paddleX += 5;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 5;
  }
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
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
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", keyDownHandler);
  document.removeEventListener("keyup", keyUpHandler);
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
