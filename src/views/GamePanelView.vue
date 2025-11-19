<template>
  <h1>welcome</h1>
</template>

<script setup>
import Raylib from "./rl.js"

// Example game using Raylib-inspired API
Raylib.InitWindow(800, 600, "Raylib-Inspired Canvas Demo");
Raylib.SetTargetFPS(60);

let rectX = 400, rectY = 300;

function update(deltaTime) {
    // Move rectangle with arrow keys
    if (Raylib.IsKeyDown('ArrowLeft')) rectX -= 200 * deltaTime;
    if (Raylib.IsKeyDown('ArrowRight')) rectX += 200 * deltaTime;
    if (Raylib.IsKeyDown('ArrowUp')) rectY -= 200 * deltaTime;
    if (Raylib.IsKeyDown('ArrowDown')) rectY += 200 * deltaTime;

    // Close window on Escape
    if (Raylib.IsKeyDown('Escape')) Raylib.CloseWindow();
}

function draw() {
    Raylib.ClearBackground(Raylib.Colors.BLACK);

    // Draw rectangle at position
    Raylib.DrawRectangle(rectX - 25, rectY - 25, 50, 50, Raylib.Colors.RED);

    // Draw mouse position
    const mouse = Raylib.GetMousePosition();
    Raylib.DrawCircle(mouse.x, mouse.y, 10, Raylib.Colors.YELLOW);

    // Draw circle if space is pressed
    if (Raylib.IsKeyDown('Space')) {
        Raylib.DrawCircle(400, 300, 50, Raylib.Colors.BLUE);
    }

    // Draw text
    Raylib.DrawText("Move with arrows, press Space!", 10, 10, 20, Raylib.Colors.WHITE);
}

Raylib.RunGameLoop(update, draw);</script>

<style scoped>
.game-canvas {
  display: block;
  margin: 0 auto;
  background: #111;
  border: 2px solid #333;
}
</style>

