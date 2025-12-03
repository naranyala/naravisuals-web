// <DOCUMENT filename="web-canvas-api-part2.js">

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

// Web Canvas API – Part 2: Advanced & Performance
export const topics = [
  {
    id: 'drawimage',
    title: 'drawImage() Mastery',
    description: 'Images, cropping, scaling, video frames, and canvas-to-canvas.',
    example: dedent(`
      // Full image
      ctx.drawImage(img, 0, 0);

      // Scaled
      ctx.drawImage(img, 0, 0, img.width, img.height, 50, 50, 400, 300);

      // Cropped (source rectangle)
      ctx.drawImage(img, 100, 50, 200, 150, 500, 100, 400, 300);

      // From video element
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Canvas → Canvas (offscreen compositing)
      ctx.drawImage(offscreenCanvas, 0, 0);
    `)
  },
  {
    id: 'offscreen-canvas',
    title: 'OffscreenCanvas & Transfer',
    description: 'True multithreaded rendering via Worker.',
    example: dedent(`
      // main.js
      const offscreen = canvas.transferControlToOffscreen();
      const worker = new Worker('render-worker.js');
      worker.postMessage({ canvas: offscreen }, [offscreen]);

      // render-worker.js
      self.onmessage = (e) => {
        const canvas = e.data.canvas;
        const ctx = canvas.getContext('2d');

        function render(time) {
          // heavy particle simulation here
          requestAnimationFrame(render);
        }
        render();
      };
    `)
  },
  {
    id: 'pixel-manipulation',
    title: 'Pixel-Level Control (ImageData)',
    description: 'Read/write raw pixels — filters, shaders, procedural textures.',
    example: dedent(`
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Invert colors
        data[i]     = 255 - data[i];     // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
        // data[i+3] is alpha
      }

      ctx.putImageData(imageData, 0, 0);

      // Or create from scratch
      const newData = ctx.createImageData(500, 500);
      // fill newData.data...
      ctx.putImageData(newData, 100, 100);
    `)
  },
  {
    id: 'hit-regions',
    title: 'Hit Regions & mouseTarget',
    description: 'Clickable shapes without manual math.',
    example: dedent(`
      ctx.beginPath();
      ctx.arc(200, 200, 80, 0, Math.PI * 2);
      ctx.fillStyle = 'crimson';
      ctx.fill();

      canvas.addEventListener('click', (e) => {
        if (e.region === 'play-button') {
          startGame();
        }
      });

      // Register region
      ctx.addHitRegion({
        id: 'play-button',
        control: document.getElementById('play-btn'), // optional DOM link
        cursor: 'pointer'
      });
    `)
  },
  {
    id: 'path2d',
    title: 'Path2D Objects',
    description: 'Reusable, transformable vector paths.',
    example: dedent(`
      const star = new Path2D(
        'M100,10 L120,80 L190,80 L135,120 L155,190 L100,150 L45,190 L65,120 L10,80 L80,80 Z'
      );

      ctx.fillStyle = '#f1c40f';
      ctx.fill(star);

      // Reuse + transform
      ctx.save();
      ctx.translate(300, 200);
      ctx.scale(2, 2);
      ctx.rotate(Date.now() * 0.001);
      ctx.fill(star);
      ctx.restore();
    `)
  },
  {
    id: 'animation-loop',
    title: 'Optimized requestAnimationFrame Loop',
    description: '60fps with delta time, pause, and fixed timestep.',
    example: dedent(`
      let lastTime = 0;
      let accumulated = 0;
      const FIXED_DT = 16; // 60 fps physics

      function loop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = timestamp - lastTime;
        lastTime = timestamp;

        accumulated += delta;

        while (accumulated >= FIXED_DT) {
          updatePhysics(FIXED_DT); // fixed timestep
          accumulated -= FIXED_DT;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        render(accumulated / FIXED_DT); // interpolation

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    `)
  },
  {
    id: 'filters',
    title: 'CSS Filters on Canvas (filter property)',
    description: 'GPU-accelerated blur, contrast, hue, etc.',
    example: dedent(`
      ctx.filter = 'blur(8px) contrast(1.4) brightness(1.2)';

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Dynamic
      ctx.filter = \`hue-rotate(\${hue}deg) saturate(\${saturation}%)\`;
      ctx.drawImage(video, 0, 0);

      // Reset
      ctx.filter = 'none';
    `)
  },
  {
    id: 'shadows-glow',
    title: 'Shadows & Glow Effects',
    description: 'Realistic depth and neon effects.',
    example: dedent(`
      ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = '#0ff';
      ctx.font = 'bold 120px monospace';
      ctx.fillText('NEON', 100, 300);

      // Multiple shadows for bloom
      ctx.shadowColor = '#f0f';
      ctx.fillText('NEON', 100, 300);
    `)
  },
  {
    id: 'image-smoothing',
    title: 'imageSmoothingEnabled',
    description: 'Crisp pixel art vs smooth scaling.',
    example: dedent(`
      // Pixel-perfect retro
      ctx.imageSmoothingEnabled = false;

      // Crisp scaling for icons
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(spriteSheet, 0, 0, 16, 16, x, y, 128, 128);
    `)
  },
  {
    id: 'get-transform',
    title: 'getTransform() / setTransform()',
    description: 'Read/write the current matrix directly.',
    example: dedent(`
      // Save current transform as object
      const matrix = ctx.getTransform();

      // Apply arbitrary matrix
      ctx.setTransform(1, 0.2, -0.2, 1, 100, 50); // shear + translate

      // Reset to identity
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Restore saved
      ctx.setTransform(matrix);
    `)
  },
  {
    id: 'bitmaprenderer',
    title: 'ImageBitmap & createImageBitmap',
    description: 'Zero-copy, GPU-uploaded textures.',
    example: dedent(`
      const bitmap = await createImageBitmap(imageElement, {
        resizeWidth: 1024,
        resizeHeight: 1024,
        premultiplyAlpha: 'none',
        colorSpaceConversion: 'none'
      });

      // Fast, zero-copy draw
      ctx.transferFromImageBitmap(bitmap);

      // Or in OffscreenCanvas worker
      offscreenCtx.transferFromImageBitmap(bitmap);
    `)
  },
  {
    id: 'willreadfrequently',
    title: 'willReadFrequently Optimization',
    description: 'Hint for getImageData() performance.',
    example: dedent(`
      // For frequent pixel reads (e.g. collision, shaders)
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: false,           // faster if no transparency
        desynchronized: true    // low-latency for tools
      });

      // Now getImageData() is much faster
      const pixels = ctx.getImageData(0, 0, w, h);
    `)
  }
];
