// <DOCUMENT filename="web-canvas-api-part1.js">

// Utility to dedent code (remove common leading whitespace)
function dedent(str) {
  const lines = str.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  const minIndent = Math.min(
    ...nonEmptyLines.map(line => {
      const match = line.match(/^ */);
      return match ? match[0].length : 0;
    })
  );
  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim();
}

// Web Canvas API – Part 1: Core Fundamentals
export const topics = [
  {
    id: 'setup-context',
    title: 'Setup & 2D Context',
    description: 'Getting the rendering context and handling resize.',
    example: dedent(`
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D context not supported');

      function resize() {
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
      }
      resize();
      window.addEventListener('resize', resize);
    `)
  },
  {
    id: 'rectangles',
    title: 'Rectangles (fill, stroke, clear)',
    description: 'The fastest way to draw boxes and erase.',
    example: dedent(`
      ctx.fillStyle = '#3498db';
      ctx.fillRect(50, 50, 200, 100);

      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 8;
      ctx.strokeRect(50, 50, 200, 100);

      ctx.clearRect(70, 70, 160, 60); // punch a hole

      // Rounded rect (manual)
      ctx.fillStyle = '#2ecc71';
      ctx.roundRect(300, 50, 150, 100, 20);
      ctx.fill();
    `)
  },
  {
    id: 'paths-basic',
    title: 'Paths – Begin, Move, Line, Close',
    description: 'Foundation of all vector drawing.',
    example: dedent(`
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(200, 50);
      ctx.lineTo(300, 150);
      ctx.closePath();

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#9b59b6';
      ctx.stroke();

      ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
      ctx.fill();
    `)
  },
  {
    id: 'arcs-circles',
    title: 'Arcs & Circles',
    description: 'Perfect circles, arcs, and pac-mans.',
    example: dedent(`
      // Full circle
      ctx.beginPath();
      ctx.arc(200, 200, 80, 0, Math.PI * 2);
      ctx.fillStyle = '#f1c40f';
      ctx.fill();

      // Arc (pac-man)
      ctx.beginPath();
      ctx.arc(400, 200, 80, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.lineTo(400, 200);
      ctx.closePath();
      ctx.fillStyle = '#e67e22';
      ctx.fill();

      // Donut
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(600, 200, 70, 0, Math.PI * 2);
      ctx.stroke();
    `)
  },
  {
    id: 'quadratic-bezier',
    title: 'Quadratic Bézier Curves',
    description: 'Smooth curves with one control point.',
    example: dedent(`
      ctx.beginPath();
      ctx.moveTo(100, 300);
      ctx.quadraticCurveTo(300, 100, 500, 300);

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#1abc9c';
      ctx.stroke();

      // Control point visualization
      ctx.fillStyle = '#999';
      ctx.beginPath();
      ctx.arc(300, 100, 10, 0, Math.PI * 2);
      ctx.fill();
    `)
  },
  {
    id: 'cubic-bezier',
    title: 'Cubic Bézier Curves',
    description: 'Professional curves with two control points.',
    example: dedent(`
      ctx.beginPath();
      ctx.moveTo(100, 500);
      ctx.bezierCurveTo(200, 300, 400, 700, 500, 500);

      ctx.lineWidth = 10;
      ctx.strokeStyle = '#3498db';
      ctx.stroke();

      // Show control points
      ctx.strokeStyle = '#95a5a6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(100, 500);
      ctx.lineTo(200, 300);
      ctx.moveTo(500, 500);
      ctx.lineTo(400, 700);
      ctx.stroke();
      ctx.setLineDash([]);
    `)
  },
  {
    id: 'text-rendering',
    title: 'Text Rendering',
    description: 'Fonts, alignment, measuring.',
    example: dedent(`
      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.fillStyle = '#2c3e50';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Canvas', 400, 200);

      ctx.font = '30px Georgia';
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.strokeText('Stroked Text', 400, 300);

      const metrics = ctx.measureText('Hello Canvas');
      ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
      ctx.fillRect(
        400 - metrics.width / 2,
        350 - 20,
        metrics.width,
        40
      );
    `)
  },
  {
    id: 'transforms',
    title: 'Transformations (translate, rotate, scale)',
    description: 'Move, rotate, and scale the coordinate system.',
    example: dedent(`
      ctx.save();
      ctx.translate(400, 400);
      ctx.rotate(Math.PI / 4);
      ctx.scale(2, 1);

      ctx.fillStyle = '#9b59b6';
      ctx.fillRect(-50, -50, 100, 100);

      ctx.restore();

      // Rotating starburst
      ctx.translate(600, 400);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = i % 2 ? '#f1c40f' : '#e67e22';
        ctx.fillRect(0, 0, 80, 20);
      }
    `)
  },
  {
    id: 'state-stack',
    title: 'State Stack (save / restore)',
    description: 'Isolate styles and transforms perfectly.',
    example: dedent(`
      // Red square
      ctx.fillStyle = 'red';
      ctx.fillRect(50, 50, 100, 100);

      ctx.save();
      ctx.fillStyle = 'blue';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'black';
      ctx.fillRect(200, 200, 150, 150);
      ctx.restore();

      // Red again — state restored!
      ctx.fillRect(400, 400, 100, 100);
    `)
  },
  {
    id: 'compositing',
    title: 'Global Composite Operations',
    description: 'Porter-Duff blending modes (source-over, xor, etc.).',
    example: dedent(`
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(100, 100, 200, 200);

      ctx.globalCompositeOperation = 'xor';
      ctx.fillStyle = '#3498db';
      ctx.fillRect(200, 150, 200, 200);

      // Difference mode
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(400, 250, 100, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over'; // reset
    `)
  },
  {
    id: 'clipping',
    title: 'Clipping Regions',
    description: 'Restrict drawing to any shape.',
    example: dedent(`
      ctx.beginPath();
      ctx.arc(400, 300, 120, 0, Math.PI * 2);
      ctx.clip(); // everything after is clipped to circle

      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(280, 180, 240, 240);

      // Image inside circle (if you have one)
      // ctx.drawImage(img, 280, 180, 240, 240);
    `)
  },
  {
    id: 'gradients-patterns',
    title: 'Gradients & Patterns',
    description: 'Linear, radial, and image patterns.',
    example: dedent(`
      // Linear gradient
      const linGrad = ctx.createLinearGradient(0, 0, 0, 400);
      linGrad.addColorStop(0, '#ff6b6b');
      linGrad.addColorStop(1, '#4ecdc4');
      ctx.fillStyle = linGrad;
      ctx.fillRect(50, 400, 300, 200);

      // Radial gradient
      const radGrad = ctx.createRadialGradient(600, 500, 20, 600, 500, 100);
      radGrad.addColorStop(0, '#f1c40f');
      radGrad.addColorStop(1, '#e67e22');
      ctx.fillStyle = radGrad;
      ctx.fillRect(500, 400, 200, 200);
    `)
  }
];
