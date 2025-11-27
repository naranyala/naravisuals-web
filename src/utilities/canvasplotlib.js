// canvasplotlib.js - Fixed version

class Axes {
  constructor(ctx, width, height, margins = { top: 40, right: 40, bottom: 60, left: 60 }) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.margins = margins;
    this.plotArea = {
      x: margins.left,
      y: margins.top,
      width: width - margins.left - margins.right,
      height: height - margins.top - margins.bottom
    };

    this.xData = [];
    this.yData = [];
    
    this.titleText = '';
    this.xlabelText = '';
    this.ylabelText = '';
    this.lineColor = '#1f77b4';
    this.lineWidth = 2;
  }

  plot(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y)) {
      throw new Error('x and y must be arrays');
    }
    if (x.length !== y.length) {
      throw new Error('x and y must have the same length');
    }
    this.xData = [...x];
    this.yData = [...y];
    return this;
  }

  title(text) {
    this.titleText = text;
    return this;
  }

  xlabel(text) {
    this.xlabelText = text;
    return this;
  }

  ylabel(text) {
    this.ylabelText = text;
    return this;
  }

  color(color) {
    this.lineColor = color;
    return this;
  }

  _scaleX(val, xMin, xMax) {
    return this.plotArea.x + ((val - xMin) / (xMax - xMin)) * this.plotArea.width;
  }

  _scaleY(val, yMin, yMax) {
    return this.plotArea.y + this.plotArea.height - ((val - yMin) / (yMax - yMin)) * this.plotArea.height;
  }

  render() {
    const { ctx, plotArea, xData, yData } = this;

    if (xData.length === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // Find data bounds
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const yMin = Math.min(...yData);
    const yMax = Math.max(...yData);

    // Add padding
    const xPadding = (xMax - xMin) * 0.05 || 1;
    const yPadding = (yMax - yMin) * 0.05 || 1;

    const actualXMin = xMin - xPadding;
    const actualXMax = xMax + xPadding;
    const actualYMin = yMin - yPadding;
    const actualYMax = yMax + yPadding;

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotArea.x, plotArea.y);
    ctx.lineTo(plotArea.x, plotArea.y + plotArea.height);
    ctx.lineTo(plotArea.x + plotArea.width, plotArea.y + plotArea.height);
    ctx.stroke();

    // Draw grid lines (optional)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    
    for (let i = 0; i <= gridLines; i++) {
      const x = plotArea.x + (plotArea.width / gridLines) * i;
      const y = plotArea.y + (plotArea.height / gridLines) * i;
      
      // Vertical grid
      ctx.beginPath();
      ctx.moveTo(x, plotArea.y);
      ctx.lineTo(x, plotArea.y + plotArea.height);
      ctx.stroke();
      
      // Horizontal grid
      ctx.beginPath();
      ctx.moveTo(plotArea.x, y);
      ctx.lineTo(plotArea.x + plotArea.width, y);
      ctx.stroke();
    }

    // Draw axis labels (tick marks)
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis ticks
    for (let i = 0; i <= gridLines; i++) {
      const x = plotArea.x + (plotArea.width / gridLines) * i;
      const value = actualXMin + ((actualXMax - actualXMin) / gridLines) * i;
      ctx.fillText(value.toFixed(1), x, plotArea.y + plotArea.height + 20);
    }
    
    // Y-axis ticks
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const y = plotArea.y + plotArea.height - (plotArea.height / gridLines) * i;
      const value = actualYMin + ((actualYMax - actualYMin) / gridLines) * i;
      ctx.fillText(value.toFixed(1), plotArea.x - 10, y + 4);
    }

    // Draw plot line
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    
    let firstPoint = true;
    for (let i = 0; i < xData.length; i++) {
      // Skip invalid points
      if (!isFinite(yData[i])) continue;
      
      const x = this._scaleX(xData[i], actualXMin, actualXMax);
      const y = this._scaleY(yData[i], actualYMin, actualYMax);
      
      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw title
    if (this.titleText) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.titleText, this.width / 2, 25);
    }

    // X label
    if (this.xlabelText) {
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.xlabelText, this.width / 2, this.height - 15);
    }

    // Y label (rotated)
    if (this.ylabelText) {
      ctx.save();
      ctx.translate(20, this.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.ylabelText, 0, 0);
      ctx.restore();
    }
  }
}

class Figure {
  constructor(canvasIdOrElement) {
    if (typeof canvasIdOrElement === 'string') {
      this.canvas = document.getElementById(canvasIdOrElement);
      if (!this.canvas) throw new Error(`Canvas with id "${canvasIdOrElement}" not found`);
    } else {
      this.canvas = canvasIdOrElement;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.axes = new Axes(this.ctx, this.canvas.width, this.canvas.height);
  }

  plot(x, y) {
    this.axes.plot(x, y);
    return this;
  }

  title(text) {
    this.axes.title(text);
    return this;
  }

  xlabel(text) {
    this.axes.xlabel(text);
    return this;
  }

  ylabel(text) {
    this.axes.ylabel(text);
    return this;
  }

  color(color) {
    this.axes.color(color);
    return this;
  }

  show() {
    this.axes.render();
    return this;
  }
}

// Global pyplot-like interface
const canvasplotlib = {
  figure: (canvasIdOrElement) => new Figure(canvasIdOrElement)
};

export default canvasplotlib;
