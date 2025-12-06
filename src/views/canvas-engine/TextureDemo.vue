<template






  >
  <div ref="canvasContainer" class="canvas-container">
    <!-- Canvas will be mounted here via JS -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { mathPlugin } from '../../lib/engine/mathPlugin.js';
import { texturePlugin } from '../../lib/engine/texturePlugin.js';

// Props or other logic if needed...

const canvasContainer = ref(null);
let app = null;
let canvas = null;
let animationId = null;

// Sample animation coroutine for demo
function* spriteAnimation() {
  const player = app.root.children[0]; // Assuming first child is the sprite
  let t = 0;
  while (true) {
    player.rotation = Math.sin(t) * 0.5;
    player.scaleX = 1 + Math.sin(t * 2) * 0.2;
    player.scaleY = 1 + Math.sin(t * 2 + Math.PI / 2) * 0.2;
    t += 0.05;
    yield 16; // 60fps ~16ms
  }
}

onMounted(async () => {
  // Create canvas
  canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = '1px solid #ccc';
  canvas.style.display = 'block';
  canvasContainer.value.appendChild(canvas);

  // Init app
  app = createCanvasApp(canvas);
  app.use(mathPlugin);
  app.use(texturePlugin);

  // Add a math grid for demo
  const grid = app.math.grid({ step: 50, labels: true, axes: true });
  grid.zIndex = -1; // Behind everything

  // Load and demo single texture
  const singleTex = await app.loadTexture('https://picsum.photos/200/150?random=1');
  const singleSprite = singleTex.createSprite();
  singleSprite.x = 100;
  singleSprite.y = 100;
  singleSprite.tint = '#ff6b6b';
  singleSprite.scaleX = 0.5;
  singleSprite.scaleY = 0.5;
  singleSprite.update = (dt) => {
    singleSprite.y += Math.sin(Date.now() / 500) * 20 * dt;
  };

  // Load atlas from Phaser example (TexturePacker format)
  const atlasUrl = 'https://cdn.phaserfiles.com/v385/assets/atlas/trimsheet/trimsheet.json';
  const atlas = await app.loadAtlas(atlasUrl);
  console.log('Loaded atlas frames:', Object.keys(atlas.textures));

  // Demo a sprite from atlas (e.g., 'explosion' frame if available)
  const atlasTex = atlas.textures['explosion'] || Object.values(atlas.textures)[0]; // Fallback to first
  const atlasSprite = atlasTex.createSprite();
  atlasSprite.x = 400;
  atlasSprite.y = 300;
  atlasSprite.flipX = true;
  atlasSprite.alpha = 0.8;

  // Start animation coroutine
  app.start('demoAnim', spriteAnimation());

  // Animation loop (app has its own, but we can add Vue-specific if needed)
  function animate() {
    // Custom Vue logic here if needed, e.g., reactivity
    animationId = requestAnimationFrame(animate);
  }
  animate();
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (app) app.stop();
  if (canvasContainer.value && canvas) {
    canvasContainer.value.removeChild(canvas);
  }
});
</script>

<style scoped>
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f0f0;
}
</style>
