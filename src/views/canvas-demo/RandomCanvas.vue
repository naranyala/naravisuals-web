
<template>
  <canvas ref="canvas" class="canvas"></canvas>
</template>

<script>
import { onMounted, ref } from "vue";
import { Vec2 } from "../../utilities/Vec2.js";

export default {
  name: "RandomCanvas",
  setup() {
    const canvas = ref(null);
    let ctx;
    let particles = [];

    const createParticle = () => {
      const pos = Vec2.create(
        Math.random() * canvas.value.width,
        Math.random() * canvas.value.height
      );
      const vel = Vec2.mul(
        Vec2.norm(Vec2.create(Math.random() - 0.5, Math.random() - 0.5)),
        2 + Math.random() * 2
      );
      return { pos, vel, radius: 5 + Math.random() * 10 };
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

      particles.forEach((p) => {
        // move
        p.pos = Vec2.add(p.pos, p.vel);

        // bounce off edges
        if (p.pos.x < p.radius || p.pos.x > canvas.value.width - p.radius) {
          p.vel.x *= -1;
        }
        if (p.pos.y < p.radius || p.pos.y > canvas.value.height - p.radius) {
          p.vel.y *= -1;
        }

        // draw
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100, 200, 255, 0.7)";
        ctx.fill();
      });

      requestAnimationFrame(update);
    };

    onMounted(() => {
      canvas.value.width = window.innerWidth;
      canvas.value.height = window.innerHeight;
      ctx = canvas.value.getContext("2d");

      // create particles
      particles = Array.from({ length: 50 }, createParticle);

      update();
    });

    return { canvas };
  },
};
</script>

<style>
.canvas {
  display: block;
  width: 50vw;
  height: 40vh;
  background: #111;
}
</style>
