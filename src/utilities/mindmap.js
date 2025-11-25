export class MindMapCanvas {
  constructor(canvas, options = {}) {
    this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    this.ctx = this.canvas.getContext('2d');

    // ── Config & Themes ─────────────────────────────────────
    this.theme = options.theme || 'minimal'; // minimal | soft | glass | custom
    this.primaryColor = options.primaryColor || '#1e3a8a'; 

    // Adjusted theme settings for a 'boxy' look
    this.themes = {
      minimal: {
        background: '#f8fafc',
        node: { fill: '#ffffff', stroke: '#cbd5e1', shadow: false, borderRadius: 8 }, 
        line: { color: '#94a3b8', width: 4, curve: 0.1 },
        text: { color: '#1e293b', weight: '700' },
        hoverScale: 1.08,
        glow: false
      },
      soft: {
        background: '#f1f5f9',
        node: { fill: '#ffffff', stroke: '#94a3b8', shadow: true, borderRadius: 12 }, 
        line: { color: '#64748b', width: 5, curve: 0.15 },
        text: { color: '#334155', weight: '700' },
        hoverScale: 1.1,
        glow: true
      },
      glass: {
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        node: { fill: 'rgba(255,255,255,0.85)', stroke: 'rgba(14,165,233,0.5)', shadow: true, borderRadius: 16 }, 
        line: { color: 'rgba(56,189,248,0.7)', width: 4.5, curve: 0.2 },
        text: { color: '#0369a1', weight: '800' },
        hoverScale: 1.15,
        glow: true
      }
    };

    const t = this.themes[this.theme] || this.themes.minimal;

    this.config = {
      background: options.background || t.background,
      nodeFill: options.nodeFill || t.node.fill,
      nodeStroke: options.nodeStroke || t.node.stroke,
      nodeShadow: t.node.shadow,
      nodeBorderRadius: t.node.borderRadius, 
      lineColor: options.lineColor || t.line.color,
      lineWidth: t.line.width,
      curveIntensity: t.line.curve,
      textColor: options.textColor || t.text.color,
      textWeight: t.text.weight,
      hoverScale: t.hoverScale,
      glowOnHover: t.glow,
      fontSize: 18, 
      ...options
    };

    // ── State ───────────────────────────────────────────────
    this.nodes = [];
    this.connections = [];
    this.hoveredNode = null;
    this.time = 0;

    this.offset = { x: 0, y: 0 };
    this.scale = 1;
    this.targetOffset = { x: 0, y: 0 };
    this.targetScale = 1;
    this.isPanning = false;
    this.lastPos = { x: 0, y: 0 };

    this.init();
  }
  
  // Helper to draw a rounded rectangle
  roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  init() {
    this.resizeCanvas();
    this.setupEvents();
    requestAnimationFrame(() => this.animate());
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }
  
  getBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    if (this.nodes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    this.nodes.forEach(n => {
      const w = n._width / 2 || 70; 
      const h = n._height / 2 || 40; 
      minX = Math.min(minX, n.x - w);
      minY = Math.min(minY, n.y - h);
      maxX = Math.max(maxX, n.x + w);
      maxY = Math.max(maxY, n.y + h);
    });
    return { minX, minY, maxX, maxY };
  }

  addNode(text, x, y, opts = {}) {
    const node = {
      id: Date.now() + Math.random(),
      text,
      x: x + (Math.random() - 0.5) * 15,
      y: y + (Math.random() - 0.5) * 15,
      color: opts.color || this.primaryColor,
      ...opts
    };
    this.nodes.push(node);
    return node;
  }

  connect(fromId, toId) {
    if (!this.connections.find(c => c.from === fromId && c.to === toId)) {
      this.connections.push({ from: fromId, to: toId });
    }
  }

  // ── Input handling ───────────────────────────────────────
  setupEvents() {
    const rect = () => this.canvas.getBoundingClientRect();

    this.canvas.addEventListener('mousedown', e => {
      this.isPanning = true;
      this.lastPos = { x: e.clientX, y: e.clientY };
    });

    this.canvas.addEventListener('mousemove', e => {
      const world = this.screenToWorld(e.clientX - rect().left, e.clientY - rect().top);
      this.hoveredNode = this.getNodeAt(world.x, world.y);

      if (this.isPanning) {
        this.targetOffset.x += e.clientX - this.lastPos.x;
        this.targetOffset.y += e.clientY - this.lastPos.y;
        this.lastPos = { x: e.clientX, y: e.clientY };
      }
    });

    ['mouseup', 'mouseleave'].forEach(ev =>
      this.canvas.addEventListener(ev, () => {
        this.isPanning = false;
        if (ev === 'mouseleave') this.hoveredNode = null;
      })
    );

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.92 : 1.08;
      this.targetScale = Math.max(0.2, Math.min(4, this.targetScale * delta));
    });

    window.addEventListener('resize', () => {
        this.resizeCanvas();
    });
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.offset.x) / this.scale,
      y: (sy - this.offset.y) / this.scale
    };
  }

  getNodeAt(x, y) {
    for (const n of this.nodes) {
      const halfW = (n._width || 140) / 2; 
      const halfH = (n._height || 80) / 2; 
      if (x > n.x - halfW && x < n.x + halfW && y > n.y - halfH && y < n.y + halfH) {
          return n;
      }
    }
    return null;
  }

  // ── Animation loop ───────────────────────────────────────
  animate() {
    this.time += 0.016;

    // Smooth easing
    this.scale += (this.targetScale - this.scale) * 0.12;
    this.offset.x += (this.targetOffset.x - this.offset.x) * 0.12;
    this.offset.y += (this.targetOffset.y - this.offset.y) * 0.12;

    this.render();
    requestAnimationFrame(() => this.animate());
  }

  // ── Rendering ───────────────────────────────────────────
  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (typeof this.config.background === 'string' && this.config.background.includes('gradient')) {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const stops = this.config.background.match(/#[0-9a-f]+/gi) || ['#f0f9ff', '#e0f2fe'];
      grad.addColorStop(0, stops[0]);
      grad.addColorStop(1, stops[1] || stops[0]);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = this.config.background;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.scale, this.scale);

    // Connections (behind)
    this.connections.forEach(c => {
      const a = this.nodes.find(n => n.id === c.from);
      const b = this.nodes.find(n => n.id === c.to);
      if (a && b) this.drawLine(a, b);
    });

    // Nodes
    this.nodes.forEach(node => this.drawNode(node));

    ctx.restore();
  }

  drawLine(a, b) {
    const cpOffset = Math.hypot(b.x - a.x, b.y - a.y) * this.config.curveIntensity;
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const perpAngle = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
    const cpX = midX + Math.cos(perpAngle) * cpOffset;
    const cpY = midY + Math.sin(perpAngle) * cpOffset;

    this.ctx.lineWidth = this.config.lineWidth / this.scale;
    this.ctx.strokeStyle = this.config.lineColor;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(a.x, a.y);
    this.ctx.quadraticCurveTo(cpX, cpY, b.x, b.y);
    this.ctx.stroke();
  }

  drawNode(node) {
    const { ctx } = this;
    const isHovered = this.hoveredNode === node;
    
    // 1. Set font for measurement and final rendering (no hover scale on text)
    ctx.font = `${this.config.textWeight} ${this.config.fontSize / this.scale}px Inter, -apple-system, sans-serif`;
    
    const textLines = this.measureTextLines(node.text);
    const lineCount = textLines.length;
    
    // 2. Define paddings and line height
    // 📢 CHANGE: Increased padding for more space inside the box
    const basePaddingX = 80; 
    const basePaddingY = 60; 
    const lineHeight = 24; // Slightly increased line height for legibility
    
    const maxTextWidth = Math.max(...textLines.map(line => ctx.measureText(line).width));
    
    const baseWidth = Math.max(maxTextWidth + basePaddingX, 120); 
    const baseHeight = lineCount * lineHeight + basePaddingY;
    
    // 3. Apply hover scaling ONLY to box dimensions
    const scale = isHovered ? this.config.hoverScale : 1;
    const boxWidth = baseWidth * scale;
    const boxHeight = baseHeight * scale;

    // Cache dimensions for hit detection (getNodeAt) and bounds (getBounds)
    node._width = boxWidth;
    node._height = boxHeight;

    const x = node.x - boxWidth / 2;
    const y = node.y - boxHeight / 2;
    const radius = this.config.nodeBorderRadius / this.scale;

    // Shadow (only if enabled)
    if (this.config.nodeShadow || (isHovered && this.config.glowOnHover)) {
      ctx.shadowBlur = isHovered ? 24 : 12;
      ctx.shadowColor = isHovered ? node.color + '66' : 'rgba(0,0,0,0.1)'; 
      ctx.shadowOffsetY = 6;
      ctx.shadowOffsetX = 0;
    } else {
      ctx.shadowBlur = 0;
    }

    // Node body (Rounded Rectangle)
    ctx.fillStyle = this.config.nodeFill;
    ctx.strokeStyle = node.color || this.config.nodeStroke; 
    ctx.lineWidth = 4 / this.scale; 

    this.roundRect(ctx, x, y, boxWidth, boxHeight, radius);
    ctx.fill();
    ctx.stroke();

    // Reset shadow for text
    ctx.shadowBlur = 0; 
    ctx.shadowOffsetY = 0;

    // Text
    ctx.fillStyle = this.config.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Line height is fixed, preventing text from scaling with the box
    this.drawWrappedText(textLines, node.x, node.y, lineHeight); 
  }

  measureTextLines(text) {
    // 📢 CHANGE: Increased max width to encourage text to stay on fewer lines
    const maxWidth = 200; 
    const words = text.split(' ');
    let line = '';
    let lines = [];

    for (const word of words) {
      const test = line + word + ' ';
      if (this.ctx.measureText(test).width > maxWidth && line) {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line = test;
      }
    }
    if (line) lines.push(line.trim());
    return lines;
  }
  
  drawWrappedText(lines, x, y, lineHeight) {
    lines.forEach((l, i) => {
      this.ctx.fillText(l, x, y + (i - (lines.length - 1) / 2) * lineHeight);
    });
  }

  clear() {
    this.nodes = [];
    this.connections = [];
  }

  // Fixed & crisp export
  exportAsImage(filename = "mindmap.png", dpiScale = 2) {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.canvas.width * dpiScale;
    exportCanvas.height = this.canvas.height * dpiScale;
    const ectx = exportCanvas.getContext('2d');
    ectx.scale(dpiScale, dpiScale);

    this.renderExportBackground(ectx, this.canvas.width, this.canvas.height);
    ectx.drawImage(this.canvas, 0, 0); 

    exportCanvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  // New function to handle background rendering for export
  renderExportBackground(ctx, width, height) {
      if (typeof this.config.background === 'string' && this.config.background.includes('gradient')) {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          const stops = this.config.background.match(/#[0-9a-f]+/gi) || ['#f0f9ff', '#e0f2fe'];
          grad.addColorStop(0, stops[0]);
          grad.addColorStop(1, stops[1] || stops[0]);
          ctx.fillStyle = grad;
      } else {
          ctx.fillStyle = this.config.background;
      }
      ctx.fillRect(0, 0, width, height);
  }

  destroy() { /* cleanup if needed */ }
}
