// roadmapCanvas.js
export class RoadmapCanvas {
  constructor(canvas, stages) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stages = stages; // reactive array (Vue ref .value)

    this.selectedStage = null;
    this.hoveredStage = null;
    this.draggedStage = null;
    this.dragOffset = { x: 0, y: 0 };

    // Transform (pan + zoom)
    this.transform = {
      scale: 1,
      x: 0,
      y: 0
    };

    // Panning
    this.isPanning = false;
    this.lastPanPoint = { x: 0, y: 0 };

    // Bind methods
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseUp);
  }

  removeEventListeners() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.transform.x, this.transform.y);
    this.ctx.scale(this.transform.scale, this.transform.scale);

    this.drawConnections();
    this.drawStages();

    this.ctx.restore();
  }

  drawConnections() {
    this.ctx.strokeStyle = '#4a5568';
    this.ctx.lineWidth = 2 / this.transform.scale;

    this.stages.forEach(stage => {
      stage.dependencies.forEach(depId => {
        const depStage = this.stages.find(s => s.id === depId);
        if (depStage) {
          this.ctx.beginPath();
          this.ctx.moveTo(depStage.x, depStage.y);
          this.ctx.lineTo(stage.x, stage.y);
          this.ctx.stroke();
        }
      });
    });
  }

  drawStages() {
    this.stages.forEach(stage => this.drawStageNode(stage));
  }

  drawStageNode(stage) {
    const { x, y } = stage;
    const isHovered = this.hoveredStage?.id === stage.id;
    const isSelected = this.selectedStage?.id === stage.id;
    const isDragging = this.draggedStage?.id === stage.id;
    const radius = isSelected ? 32 : isDragging ? 34 : 25;

    const fillColor = stage.completed ? '#48bb78' : '#4299e1';
    const borderColor = isSelected ? '#fbbf24' : '#ffffff';
    const borderWidth = isSelected ? 4 : 2;

    // Shadow for depth when dragging
    if (isDragging) {
      this.ctx.shadowColor = 'rgba(0,0,0,0.4)';
      this.ctx.shadowBlur = 20;
      this.ctx.shadowOffsetY = 8;
    }

    this.ctx.fillStyle = fillColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderWidth / this.transform.scale;
    this.ctx.stroke();

    // Reset shadow
    this.ctx.shadowColor = 'transparent';

    // Text: ID
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(stage.id.toString(), x, y);

    // Title below
    this.ctx.fillStyle = isDragging ? '#e2e8f0' : '#cbd5e1';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(stage.title, x, y + 38);
  }

  getTransformedPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.transform.x) / this.transform.scale,
      y: (clientY - rect.top - this.transform.y) / this.transform.scale
    };
  }

  findStageAtPoint(x, y) {
    return this.stages.find(stage => {
      const dx = stage.x - x;
      const dy = stage.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 35;
    });
  }

  // === Mouse handlers ===
  handleMouseDown(e) {
    if (e.button === 1 || e.button === 0 && (e.ctrlKey || e.metaKey)) {
      // Middle click or Ctrl+Left = pan
      this.isPanning = true;
      this.lastPanPoint = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    const point = this.getTransformedPoint(e.clientX, e.clientY);
    const stage = this.findStageAtPoint(point.x, point.y);

    if (stage) {
      this.draggedStage = stage;
      this.dragOffset = { x: stage.x - point.x, y: stage.y - point.y };
      this.selectedStage = stage;
      this.canvas.style.cursor = 'grabbing';
    } else {
      this.isPanning = true;
      this.lastPanPoint = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = 'grabbing';
    }
    this.draw();
  }

  handleMouseMove(e) {
    const point = this.getTransformedPoint(e.clientX, e.clientY);

    if (this.draggedStage) {
      // Dragging a node
      this.draggedStage.x = point.x + this.dragOffset.x;
      this.draggedStage.y = point.y + this.dragOffset.y;
      this.draw();
      return;
    }

    if (this.isPanning) {
      const dx = e.clientX - this.lastPanPoint.x;
      const dy = e.clientY - this.lastPanPoint.y;
      this.transform.x += dx;
      this.transform.y += dy;
      this.lastPanPoint = { x: e.clientX, y: e.clientY };
      this.draw();
      return;
    }

    // Hover detection
    const hovered = this.findStageAtPoint(point.x, point.y);
    if (hovered !== this.hoveredStage) {
      this.hoveredStage = hovered;
      this.canvas.style.cursor = hovered ? 'grab' : this.isPanning ? 'grabbing' : 'default';
      this.draw();
    }
  }

  handleMouseUp() {
    this.draggedStage = null;
    this.isPanning = false;
    this.canvas.style.cursor = this.hoveredStage ? 'grab' : 'default';
    this.draw();
  }

  // Zoom
  zoom(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const point = this.getTransformedPoint(e.clientX, e.clientY);

    // Zoom toward mouse position
    this.transform.x = e.clientX - (e.clientX - this.transform.x) * delta;
    this.transform.y = e.clientY - (e.clientY - this.transform.y) * delta;
    this.transform.scale *= delta;

    this.transform.scale = Math.max(0.2, Math.min(this.transform.scale, 5));
    this.draw();
  }

  // Inside RoadmapCanvas class — replace the old resetView()
  resetView() {
    if (this.stages.length === 0) {
      this.transform = { scale: 1, x: 0, y: 0 };
      this.draw();
      return;
    }

    // Step 1: Find min/max X and Y of all stages
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    this.stages.forEach(stage => {
      const radius = 40; // approx node radius + title
      minX = Math.min(minX, stage.x - radius);
      maxX = Math.max(maxX, stage.x + radius);
      minY = Math.min(minY, stage.y - radius);
      maxY = Math.max(maxY, stage.y + radius + 50); // extra for title
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) {
      this.transform = { scale: 1, x: this.canvas.width / 2, y: this.canvas.height / 2 };
      this.draw();
      return;
    }

    // Step 2: Add padding (15% of content size, or minimum 100px)
    const padding = Math.max(100, Math.min(contentWidth, contentHeight) * 0.15);
    const paddedWidth = contentWidth + padding * 2;
    const paddedHeight = contentHeight + padding * 2;

    // Step 3: Calculate scale to fit canvas
    const scaleX = this.canvas.width / paddedWidth;
    const scaleY = this.canvas.height / paddedHeight;
    const scale = Math.min(scaleX, scaleY, 1.5); // cap max zoom-in

    // Step 4: Center the content
    const centerX = minX + contentWidth / 2;
    const centerY = minY + contentHeight / 2;

    this.transform = {
      scale: Math.max(0.1, scale * 0.9), // slight margin
      x: this.canvas.width / 2 - centerX * scale * 0.9,
      y: this.canvas.height / 2 - centerY * scale * 0.9
    };

    this.draw();
  }

  destroy() {
    this.removeEventListeners();
  }
}
