// confetti-cannon.js
export function confettiCannon({
  x = innerWidth / 2,
  y = innerHeight / 3,
  count = 150,
  gravity = 0.8,
  wind = 0,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f3722c']
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: Math.random() * 12 - 6,
      vy: Math.random() * -12 - 5,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      spin: Math.random() * 15 - 7.5,
      life: 1
    });
  }

  let anim;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      p.x += p.vx + wind;
      p.y += p.vy;
      p.vy += gravity * 0.1;
      p.rotation += p.spin;
      p.life -= 0.008;

      if (p.life <= 0) continue;
      alive++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    if (alive) anim = requestAnimationFrame(draw);
    else canvas.remove();
  };
  draw();

  return { stop: () => cancelAnimationFrame(anim) };
}
