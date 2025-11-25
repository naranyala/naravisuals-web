export class MindMapCanvas {
  constructor(canvas, options = {}) {
    // Accept both canvas element or canvas ID
    this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Configuration
    this.config = {
      nodeRadius: options.nodeRadius || 30,
      nodeColor: options.nodeColor || '#4A90E2',
      nodeTextColor: options.nodeTextColor || '#FFFFFF',
      lineColor: options.lineColor || '#666666',
      lineWidth: options.lineWidth || 2,
      fontSize: options.fontSize || 14,
      ...options
    };
    
    // State
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.dragging = false;
    this.isPanning = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.scale = 1;
    this.panOffset = { x: 0, y: 0 };
    
    // Animation state
    this.targetPanOffset = { x: 0, y: 0 };
    this.targetScale = 1;
    this.animating = false;
    this.velocity = { x: 0, y: 0 };
    this.damping = 0.15; // Jelly-like damping
    this.springStrength = 0.08;
    
    this.init();
  }
  
  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.render();
  }
  
  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    
    // Center the canvas on resize (without animation for immediate resize)
    this.centerCanvas(false);
  }
  
  centerCanvas(animate = true) {
    if (this.nodes.length === 0) {
      const targetX = this.canvas.width / 2;
      const targetY = this.canvas.height / 2;
      
      if (animate) {
        this.animateTo(targetX, targetY, 1);
      } else {
        this.panOffset.x = targetX;
        this.panOffset.y = targetY;
        this.targetPanOffset.x = targetX;
        this.targetPanOffset.y = targetY;
      }
      return;
    }
    
    // Calculate bounding box of all nodes (including dynamic radius)
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    this.nodes.forEach(node => {
      const radius = node._actualRadius || node.radius;
      minX = Math.min(minX, node.x - radius);
      minY = Math.min(minY, node.y - radius);
      maxX = Math.max(maxX, node.x + radius);
      maxY = Math.max(maxY, node.y + radius);
    });
    
    // Add padding (50px)
    const padding = 50;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Calculate scale to fit all nodes with padding
    const scaleX = (this.canvas.width - padding * 2) / contentWidth;
    const scaleY = (this.canvas.height - padding * 2) / contentHeight;
    const fitScale = Math.min(scaleX, scaleY, 1); // Don't zoom in more than 1x
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Center the mindmap in the canvas
    const targetX = this.canvas.width / 2 - centerX * fitScale;
    const targetY = this.canvas.height / 2 - centerY * fitScale;
    
    if (animate) {
      this.animateTo(targetX, targetY, fitScale);
    } else {
      this.panOffset.x = targetX;
      this.panOffset.y = targetY;
      this.targetPanOffset.x = targetX;
      this.targetPanOffset.y = targetY;
      this.scale = fitScale;
      this.targetScale = fitScale;
    }
  }
  
  animateTo(targetX, targetY, targetScale) {
    this.targetPanOffset.x = targetX;
    this.targetPanOffset.y = targetY;
    this.targetScale = targetScale;
    this.animating = true;
    this.animate();
  }
  
  animate() {
    if (!this.animating) return;
    
    // Spring physics for smooth jelly-like movement
    const dx = this.targetPanOffset.x - this.panOffset.x;
    const dy = this.targetPanOffset.y - this.panOffset.y;
    const dScale = this.targetScale - this.scale;
    
    // Apply spring force
    this.velocity.x += dx * this.springStrength;
    this.velocity.y += dy * this.springStrength;
    
    // Apply damping
    this.velocity.x *= (1 - this.damping);
    this.velocity.y *= (1 - this.damping);
    
    // Update position
    this.panOffset.x += this.velocity.x;
    this.panOffset.y += this.velocity.y;
    
    // Smooth scale transition
    this.scale += dScale * 0.1;
    
    // Check if animation is complete
    const threshold = 0.5;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold && 
        Math.abs(dScale) < 0.01 && 
        Math.abs(this.velocity.x) < 0.1 && Math.abs(this.velocity.y) < 0.1) {
      this.animating = false;
      this.panOffset.x = this.targetPanOffset.x;
      this.panOffset.y = this.targetPanOffset.y;
      this.scale = this.targetScale;
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
    
    this.render();
    
    if (this.animating) {
      requestAnimationFrame(() => this.animate());
    }
  }
  
  setupEventListeners() {
    this.mouseDownHandler = this.handleMouseDown.bind(this);
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    this.wheelHandler = this.handleWheel.bind(this);
    this.resizeHandler = () => {
      this.resizeCanvas();
      this.render();
    };
    
    this.canvas.addEventListener('mousedown', this.mouseDownHandler);
    this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
    this.canvas.addEventListener('mouseup', this.mouseUpHandler);
    this.canvas.addEventListener('wheel', this.wheelHandler);
    window.addEventListener('resize', this.resizeHandler);
  }
  
  destroy() {
    this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
    this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
    this.canvas.removeEventListener('wheel', this.wheelHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }
  
  
  addNode(text, x, y, options = {}) {
    // Add slight random offset for organic feel
    const jitter = 5;
    const jitterX = (Math.random() - 0.5) * jitter;
    const jitterY = (Math.random() - 0.5) * jitter;
    
    const node = {
      id: Date.now() + Math.random(),
      text,
      x: x + jitterX,
      y: y + jitterY,
      radius: options.radius || this.config.nodeRadius,
      color: options.color || this.config.nodeColor,
      textColor: options.textColor || this.config.nodeTextColor,
      children: [],
      wobble: Math.random() * Math.PI * 2 // Random phase for wobble effect
    };
    this.nodes.push(node);
    this.render();
    return node;
  }
  
  removeNode(nodeId) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.connections = this.connections.filter(
      c => c.from !== nodeId && c.to !== nodeId
    );
    this.render();
  }
  
  updateNode(nodeId, updates) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, updates);
      this.render();
    }
  }
  
  connect(fromNodeId, toNodeId) {
    const exists = this.connections.some(
      c => c.from === fromNodeId && c.to === toNodeId
    );
    if (!exists) {
      this.connections.push({ from: fromNodeId, to: toNodeId });
      this.render();
    }
  }
  
  disconnect(fromNodeId, toNodeId) {
    this.connections = this.connections.filter(
      c => !(c.from === fromNodeId && c.to === toNodeId)
    );
    this.render();
  }
  
  getNodeAt(x, y) {
    const transformed = this.screenToWorld(x, y);
    return this.nodes.find(node => {
      const dx = transformed.x - node.x;
      const dy = transformed.y - node.y;
      const radius = node._actualRadius || node.radius;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }
  
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.panOffset.x) / this.scale,
      y: (screenY - this.panOffset.y) / this.scale
    };
  }
  
  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.scale + this.panOffset.x,
      y: worldY * this.scale + this.panOffset.y
    };
  }
  
  // Event handlers
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.isPanning = true;
    this.lastMousePos = { x, y };
  }
  
  handleMouseMove(e) {
    if (this.isPanning) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const dx = x - this.lastMousePos.x;
      const dy = y - this.lastMousePos.y;
      
      // Direct pan without target (for responsive feel)
      this.panOffset.x += dx;
      this.panOffset.y += dy;
      this.targetPanOffset.x = this.panOffset.x;
      this.targetPanOffset.y = this.panOffset.y;
      
      this.lastMousePos = { x, y };
      this.render();
    }
  }
  
  handleMouseUp() {
    this.isPanning = false;
  }
  
  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = this.scale * delta;
    this.scale = Math.max(0.1, Math.min(5, newScale));
    this.targetScale = this.scale;
    this.render();
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    
    this.ctx.translate(this.panOffset.x, this.panOffset.y);
    this.ctx.scale(this.scale, this.scale);
    
    this.connections.forEach(conn => {
      const fromNode = this.nodes.find(n => n.id === conn.from);
      const toNode = this.nodes.find(n => n.id === conn.to);
      if (fromNode && toNode) {
        this.drawConnection(fromNode, toNode);
      }
    });
    
    this.nodes.forEach(node => this.drawNode(node));
    
    this.ctx.restore();
    
    // Continue animating if there's wobble effect
    if (this.nodes.length > 0 && !this.animating) {
      requestAnimationFrame(() => this.render());
    }
  }
  
  drawNode(node) {
    // Measure text to determine node size
    this.ctx.font = `${this.config.fontSize / this.scale}px Arial`;
    const words = node.text.split(' ');
    const maxWidth = node.radius * 1.6; // Max width for text wrapping
    const lines = [];
    let currentLine = words[0];
    
    // Wrap text into multiple lines
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = this.ctx.measureText(testLine);
      const testWidth = metrics.width / this.scale;
      
      if (testWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    // Calculate required radius based on text
    const lineHeight = this.config.fontSize / this.scale * 1.2;
    const textHeight = lines.length * lineHeight;
    const maxTextWidth = Math.max(...lines.map(line => 
      this.ctx.measureText(line).width / this.scale
    ));
    
    // Adjust node radius to fit text with padding
    const padding = 10;
    const minRadius = Math.max(
      (maxTextWidth / 2) + padding,
      (textHeight / 2) + padding,
      this.config.nodeRadius * 0.6 // Minimum size
    );
    const actualRadius = Math.max(node.radius, minRadius);
    
    // Add subtle wobble/breathing effect
    const time = Date.now() * 0.001;
    const wobble = Math.sin(time + node.wobble) * 1.5;
    const wobbleRadius = actualRadius + wobble;
    
    // Draw circle with wobble
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, wobbleRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = node.color;
    this.ctx.fill();
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2 / this.scale;
    this.ctx.stroke();
    
    // Draw multi-line text
    this.ctx.fillStyle = node.textColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const startY = node.y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      this.ctx.fillText(line, node.x, startY + (index * lineHeight));
    });
    
    // Store actual radius for collision detection
    node._actualRadius = actualRadius;
  }
  
  drawConnection(fromNode, toNode) {
    this.ctx.beginPath();
    this.ctx.moveTo(fromNode.x, fromNode.y);
    this.ctx.lineTo(toNode.x, toNode.y);
    this.ctx.strokeStyle = this.config.lineColor;
    this.ctx.lineWidth = this.config.lineWidth / this.scale;
    this.ctx.stroke();
    
    // Use actual radius for arrow positioning
    const toRadius = toNode._actualRadius || toNode.radius;
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    const arrowLength = 15 / this.scale;
    const arrowX = toNode.x - Math.cos(angle) * toRadius;
    const arrowY = toNode.y - Math.sin(angle) * toRadius;
    
    this.ctx.beginPath();
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
      arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
      arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }
  exportData() {
    return JSON.stringify({
      nodes: this.nodes,
      connections: this.connections
    });
  }
  
  importData(jsonData) {
    const data = JSON.parse(jsonData);
    this.nodes = data.nodes;
    this.connections = data.connections;
    this.render();
  }
  
  clear() {
    this.nodes = [];
    this.connections = [];
    this.render();
  }

exportAsImage(filename = 'mindmap.png') {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = this.canvas.width;
  tempCanvas.height = this.canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.fillStyle = '#FFFFFF';
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(this.canvas, 0, 0);
  
  tempCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

}
