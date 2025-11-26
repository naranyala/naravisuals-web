class VectorRenderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
  }

  // Convert mathematical coordinates to screen coordinates
  toScreen(v) {
    return {
      x: this.centerX + v.x,
      y: this.centerY - v.y
    };
  }

  // Convert screen coordinates to mathematical coordinates
  toMath(screenX, screenY) {
    return {
      x: screenX - this.centerX,
      y: this.centerY - screenY
    };
  }

  drawBackground(color = '#f8f9fa') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(step = 50, color = '#e0e0e0', lineWidth = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    
    // Vertical lines
    for (let x = 0; x <= this.width; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.height; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawAxes(lineWidth = 2, color = '#333', fontSize = 12) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px Arial`;
    
    // X-axis
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.centerY);
    this.ctx.lineTo(this.width, this.centerY);
    this.ctx.stroke();
    
    // Y-axis
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, 0);
    this.ctx.lineTo(this.centerX, this.height);
    this.ctx.stroke();

    // Axis labels
    this.ctx.fillText('X', this.width - 20, this.centerY - 10);
    this.ctx.fillText('Y', this.centerX + 10, 20);
    this.ctx.fillText('0', this.centerX + 5, this.centerY + 15);
  }

  drawCoordinateNumbers(step = 50, fontSize = 10, color = '#666') {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // X-axis numbers (bottom)
    for (let x = this.centerX + step; x < this.width; x += step) {
      const mathX = (x - this.centerX);
      this.ctx.fillText(mathX.toString(), x, this.centerY + 15);
    }
    for (let x = this.centerX - step; x > 0; x -= step) {
      const mathX = (x - this.centerX);
      this.ctx.fillText(mathX.toString(), x, this.centerY + 15);
    }

    // Y-axis numbers (left side)
    for (let y = this.centerY + step; y < this.height; y += step) {
      const mathY = (this.centerY - y);
      this.ctx.fillText(mathY.toString(), this.centerX - 15, y);
    }
    for (let y = this.centerY - step; y > 0; y -= step) {
      const mathY = (this.centerY - y);
      this.ctx.fillText(mathY.toString(), this.centerX - 15, y);
    }

    // Reset text alignment
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
  }

  drawVector(start, vec, color = '#000', label = '', lineWidth = 3, arrowSize = 12) {
    const screenStart = this.toScreen(start);
    const screenEnd = this.toScreen({
      x: start.x + vec.x,
      y: start.y + vec.y
    });
    
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = lineWidth;
    
    // Draw the vector line
    this.ctx.beginPath();
    this.ctx.moveTo(screenStart.x, screenStart.y);
    this.ctx.lineTo(screenEnd.x, screenEnd.y);
    this.ctx.stroke();
    
    // Draw the arrowhead
    const angle = Math.atan2(screenEnd.y - screenStart.y, screenEnd.x - screenStart.x);
    this.ctx.beginPath();
    this.ctx.moveTo(screenEnd.x, screenEnd.y);
    this.ctx.lineTo(
      screenEnd.x - arrowSize * Math.cos(angle - Math.PI / 6),
      screenEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.lineTo(
      screenEnd.x - arrowSize * Math.cos(angle + Math.PI / 6),
      screenEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw label if provided
    if (label) {
      this.ctx.fillStyle = color;
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillText(label, screenEnd.x + 10, screenEnd.y - 10);
    }
  }

  drawPoint(point, color = '#000', size = 6) {
    const screen = this.toScreen(point);
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(screen.x, screen.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawText(text, point, color = '#333', fontSize = 12) {
    const screen = this.toScreen(point);
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillText(text, screen.x + 8, screen.y - 8);
  }

  drawDashedLine(start, end, color = '#95a5a6', lineWidth = 1, dashPattern = [5, 5]) {
    this.ctx.setLineDash(dashPattern);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    const screenStart = this.toScreen(start);
    const screenEnd = this.toScreen(end);
    this.ctx.beginPath();
    this.ctx.moveTo(screenStart.x, screenStart.y);
    this.ctx.lineTo(screenEnd.x, screenEnd.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawCoordinateSystem(showGrid = true, showNumbers = true) {
    this.drawBackground();
    if (showGrid) {
      this.drawGrid();
    }
    this.drawAxes();
    if (showNumbers) {
      this.drawCoordinateNumbers();
    }
  }

  // Helper to draw multiple vectors with consistent styling
  drawVectors(vectors, origin = { x: 0, y: 0 }) {
    vectors.forEach(({ vector, color, label }) => {
      this.drawVector(origin, vector, color, label);
    });
  }

  // Helper to draw multiple points
  drawPoints(points) {
    points.forEach(({ point, color, size }) => {
      this.drawPoint(point, color, size);
    });
  }
}

export default VectorRenderer;
