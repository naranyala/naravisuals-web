

/* CanvasDemo.jsx  (Vue 3 + jsx + goober + motion) */
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { css } from 'goober';
import { animate } from 'motion';

import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'

/* ----------  grouped styles  ---------- */
const styles = {
  page: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #111;
    color: #eee;
    font-family: system-ui, sans-serif;
  `,

  caption: css`
    margin: 0 0 1rem;
    font-size: 1.5rem;
    letter-spacing: 0.5px;
  `,

  canvasWrapper: css`
    width: min(90vw, 800px);
    aspect-ratio: 8 / 6;
    border: 2px solid #444;
    border-radius: 8px;
    overflow: hidden;
  `,

  canvas: css`
    width: 100%;
    height: 100%;
    display: block;
  `,
};

export default defineComponent({
  name: 'CanvasDemo',
  setup() {
    const canvasRef = ref(null);
    const engineRef = ref(null);

    onMounted(() => {
      const canvas = canvasRef.value;
      /* make drawing-buffer exactly 800×600  –  CSS scales it */
      canvas.width = 600;
      canvas.height = 400;

      const app = createCanvasApp(canvas);
      app.use(shapesPlugin);
      engineRef.value = app;
      runScene(app);
    });

    onUnmounted(() => engineRef.value?.stop());

    /* ----------  demo scene  ---------- */
    function runScene(app) {
      const { shapes, start } = app;

      shapes.rect(400, 300, 800, 600, '#1d1d1d');          // bg

      for (let i = 0; i < 7; i++) {                        // orbital rings
        shapes.circle(400, 300, 40 + i * 28, 'transparent', {
          stroke: `hsl(${i * 50}, 70%, 60%)`,
          lineWidth: 2,
        });
      }

      const core = shapes.circle(400, 300, 20, '#ffd93d'); // pulsing core
      start(function*() {
        let t = 0;
        while (true) {
          t += 0.05;
          core.scaleX = core.scaleY = 1 + Math.sin(t) * 0.2;
          yield 16;
        }
      }, 'pulse');

      const satellite = shapes.circle(0, 0, 12, '#ff4d4d'); // red satellite
      let angle = 0;
      satellite.update = dt => {
        angle += dt * 0.001;
        const r = 120;
        satellite.x = 400 + Math.cos(angle) * r;
        satellite.y = 300 + Math.sin(angle) * r;
      };

      for (let i = 0; i < 60; i++) {                       // stars
        shapes.circle(
          Math.random() * 800,
          Math.random() * 600,
          Math.random() * 2 + 1,
          'rgba(255,255,255,.6)'
        );
      }

      shapes.text(                                         // title
        'canvas_util + shapesPlugin → Vue 3 + goober + motion',
        400,
        50,
        '22px sans-serif',
        '#eee',
        { align: 'center' }
      );
    }

    /* ----------  render  ---------- */
    return () => (
      <div class={styles.page}>
        <h2 class={styles.caption}>Tiny Canvas-Engine Vue Demo</h2>

        <div class={styles.canvasWrapper}>
          <canvas ref={canvasRef} class={styles.canvas} />
        </div>
      </div>
    );
  },
});
