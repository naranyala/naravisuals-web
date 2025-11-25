// mouse-trail.js
export function mouseTrail({ color = '#00ffff', count = 30, fade = 0.95 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const points = [];

  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  };
  resize();
  window.addEventListener('resize', resize);

  const draw = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${1 - fade})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const alpha = i / points.length;
      ctx.fillStyle = color.replace(/[^,]+(?=\))/, alpha * 0.8);
      ctx.beginPath();
      ctx.arc(p.x, p.y, (i / points.length) * 15, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const onMove = (e) => {
    points.unshift({ x: e.clientX, y: e.clientY });
    if (points.length > count) points.pop();
  };

  window.addEventListener('pointermove', onMove);
  const loop = () => { draw(); requestAnimationFrame(loop); };
  loop();

  return { destroy: () => {
    window.removeEventListener('pointermove', onMove);
    canvas.remove();
  }};
}
