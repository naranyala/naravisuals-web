/* PureSvgShapesPlayground.jsx */
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { css } from 'goober';
import { animate, stagger } from 'motion';

/* ========== ALL STYLES (DARK + GLOW) ========== */
const styles = {
  container: css`
    position: fixed;
    inset: 0;
    background: #000;
    overflow: hidden;
    font-family: system-ui, sans-serif;
  `,

  title: css`
    position: absolute;
    top: 3rem;
    left: 3rem;
    font-size: 4.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #60a5fa, #c084fc, #f472b6);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    z-index: 10;
    user-select: none;
    filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.6));
  `,
};

/* ========== SVG FILTERS (Gooey + Glow) ========== */
const filters = `
  <defs>
    <!-- Gooey effect -->
    <filter id="goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur"/>
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"/>
      <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
    </filter>

    <!-- Neon glow -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
      </feMerge>
    </filter>
  </defs>
`;

/* ========== MAIN COMPONENT ========== */
export default defineComponent({
  setup() {
    const svgRef = ref(null);

    const createBlob = () => {
      const cx = Math.random() * 100 + '%';
      const cy = Math.random() * 100 + '%';
      const r = Math.random() * 180 + 100;
      const hue = Math.random() * 360;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', `hsl(${hue}, 80%, 60%)`);
      circle.setAttribute('opacity', '0.6');
      circle.setAttribute('filter', 'url(#glow)');

      svgRef.value.appendChild(circle);

      // Floating motion
      animate(
        circle,
        {
          cx: [cx, `${parseFloat(cx) + (Math.random() > 0.5 ? 15 : -15)}%`, cx],
          cy: [cy, `${parseFloat(cy) + (Math.random() > 0.5 ? 15 : -15)}%`, cy],
        },
        {
          duration: 20 + Math.random() * 25,
          repeat: Infinity,
          easing: 'ease-in-out',
        }
      );

      // Pulsing scale
      animate(
        circle,
        { r: [r, r * 1.4, r] },
        {
          duration: 8 + Math.random() * 12,
          repeat: Infinity,
          easing: 'ease-in-out',
        }
      );
    };

    onMounted(() => {
      // Initial burst
      for (let i = 0; i < 10; i++) {
        setTimeout(createBlob, i * 300);
      }

      // Continuous spawn
      const interval = setInterval(() => {
        createBlob();
      }, 4000);

      // Click = explosion of blobs
      const handleClick = () => {
        for (let i = 0; i < 6; i++) {
          setTimeout(createBlob, i * 100);
        }
      };
      window.addEventListener('click', handleClick);

      onUnmounted(() => {
        clearInterval(interval);
        window.removeEventListener('click', handleClick);
      });
    });

    return () => (
      <div class={styles.container}>
        <h1 class={styles.title}>Pure SVG Shapes</h1>

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0, filter: 'url(#goo)' }}
          dangerouslySetInnerHTML={{ __html: filters }}
        />

        <div style={{
          position: 'absolute',
          bottom: '2rem',
          right: '3rem',
          color: '#475569',
          fontSize: '1rem',
          zIndex: 10,
        }}>
          Click anywhere • Raw SVG + Motion One • No libraries
        </div>
      </div>
    );
  },
});
