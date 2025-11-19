<script setup>

import { RL } from "./rl.js";

RL.InitWindow(640, 480, "Snake — MiniRaylibJS");
RL.SetTargetFPS(10); // snake tick rate, not animation rate

// -------------------------
// CONFIG
// -------------------------
const CELL = 20;
const GRID_W = RL.width / CELL;
const GRID_H = RL.height / CELL;

// -------------------------
// GAME STATE
// -------------------------
let snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
];

let dir = { x: 1, y: 0 };
let food = RandomFood();
let gameOver = false;

// -------------------------
// HELPERS
// -------------------------
function RandomFood() {
    return {
        x: Math.floor(Math.random() * GRID_W),
        y: Math.floor(Math.random() * GRID_H),
    };
}

// -------------------------
// INPUT
// -------------------------
function HandleInput() {
    if (RL.IsKeyDown("ArrowUp") && dir.y !== 1) dir = { x: 0, y: -1 };
    if (RL.IsKeyDown("ArrowDown") && dir.y !== -1) dir = { x: 0, y: 1 };
    if (RL.IsKeyDown("ArrowLeft") && dir.x !== 1) dir = { x: -1, y: 0 };
    if (RL.IsKeyDown("ArrowRight") && dir.x !== -1) dir = { x: 1, y: 0 };
}

// -------------------------
// GAME LOGIC
// -------------------------
function UpdateSnake() {
    if (gameOver) return;

    const head = { 
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y
    };

    // collision with wall
    if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
        gameOver = true;
        return;
    }

    // collision with itself
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver = true;
            return;
        }
    }

    // insert new head
    snake.unshift(head);

    // eat food
    if (head.x === food.x && head.y === food.y) {
        food = RandomFood();
    } else {
        // remove tail
        snake.pop();
    }
}

// -------------------------
// DRAW
// -------------------------
function DrawCell(x, y, color) {
    RL.DrawRectangle(x * CELL, y * CELL, CELL - 1, CELL - 1, color);
}

function Draw() {
    RL.BeginDrawing();

    RL.DrawRectangle(0, 0, RL.width, RL.height, "#333");

    // draw snake
    for (let s of snake) {
        DrawCell(s.x, s.y, "#00ff00");
    }

    // draw food
    DrawCell(food.x, food.y, "#ff4444");

    // game over text
    if (gameOver) {
        RL.DrawText(
            "GAME OVER",
            RL.width / 2 - 100,
            RL.height / 2,
            32,
            "white"
        );
    }

    RL.EndDrawing();
}

// -------------------------
// RUN
// -------------------------
RL.Run(() => {
    HandleInput();
    UpdateSnake();
    Draw();
});
</script>

<template>
  <h1>welcome</h1>
</template>

<style scoped>
</style>
