// canvasplotlib.js - Ultimate Math Function Plotter Edition
// Reusable Canvas Plotting Library

class CanvasPlotLib {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.plotCtx = {
            xmin: -10, xmax: 10,
            ymin: -10, ymax: 10,
            width: this.width,
            height: this.height,
            area: { x: 70, y: 50, width: this.width - 100, height: this.height - 100 },
            bgColor: '#F8F9FA',
            showGrid: true
        };
        
        this.colors = {
            DARKGRAY: '#2F4F4F',
            WHITE: '#FFFFFF',
            BLUE: '#1E90FF',
            LIGHTGRAY: '#E0E0E0'
        };
    }

    setPlotArea(x, y, width, height) {
        this.plotCtx.area = { x, y, width, height };
    }

    setPlotRange(xmin, xmax, ymin, ymax) {
        this.plotCtx.xmin = xmin;
        this.plotCtx.xmax = xmax;
        this.plotCtx.ymin = ymin;
        this.plotCtx.ymax = ymax;
    }

    setBackgroundColor(color) {
        this.plotCtx.bgColor = color;
    }

    setGridVisible(visible) {
        this.plotCtx.showGrid = visible;
    }

    scaleX(x) {
        const ctx = this.plotCtx;
        const range = ctx.xmax - ctx.xmin;
        return ctx.area.x + (x - ctx.xmin) / range * ctx.area.width;
    }

    scaleY(y) {
        const ctx = this.plotCtx;
        const range = ctx.ymax - ctx.ymin;
        return ctx.area.y + ctx.area.height - (y - ctx.ymin) / range * ctx.area.height;
    }

    initPlot(width, height) {
        this.width = width || this.canvas.width;
        this.height = height || this.canvas.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.plotCtx.width = this.width;
        this.plotCtx.height = this.height;
        this.plotCtx.area = { 
            x: 70, y: 50, 
            width: this.width - 100, 
            height: this.height - 100 
        };
    }

    clear() {
        this.ctx.fillStyle = this.plotCtx.bgColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawGridAndAxes() {
        const ctx = this.plotCtx;
        
        this.clear();

        if (ctx.showGrid) {
            this.ctx.strokeStyle = this.colors.LIGHTGRAY;
            this.ctx.lineWidth = 1;
            
            for (let i = Math.ceil(ctx.xmin); i <= Math.floor(ctx.xmax); i++) {
                if (i === 0) continue;
                const x = this.scaleX(i);
                this.ctx.beginPath();
                this.ctx.moveTo(x, ctx.area.y);
                this.ctx.lineTo(x, ctx.area.y + ctx.area.height);
                this.ctx.stroke();
            }
            
            for (let i = Math.ceil(ctx.ymin); i <= Math.floor(ctx.ymax); i++) {
                if (i === 0) continue;
                const y = this.scaleY(i);
                this.ctx.beginPath();
                this.ctx.moveTo(ctx.area.x, y);
                this.ctx.lineTo(ctx.area.x + ctx.area.width, y);
                this.ctx.stroke();
            }
        }

        // Axes
        this.ctx.strokeStyle = this.colors.DARKGRAY;
        this.ctx.lineWidth = 2;
        
        const zeroX = this.scaleX(0);
        const zeroY = this.scaleY(0);
        
        if (zeroX >= ctx.area.x && zeroX <= ctx.area.x + ctx.area.width) {
            this.ctx.beginPath();
            this.ctx.moveTo(zeroX, ctx.area.y);
            this.ctx.lineTo(zeroX, ctx.area.y + ctx.area.height);
            this.ctx.stroke();
        }
        
        if (zeroY >= ctx.area.y && zeroY <= ctx.area.y + ctx.area.height) {
            this.ctx.beginPath();
            this.ctx.moveTo(ctx.area.x, zeroY);
            this.ctx.lineTo(ctx.area.x + ctx.area.width, zeroY);
            this.ctx.stroke();
        }

        // Border
        this.ctx.strokeStyle = this.colors.DARKGRAY;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(ctx.area.x, ctx.area.y, ctx.area.width, ctx.area.height);
    }

    plotFunction(color, tMin, tMax, steps, fX, fY, time = 0) {
        const points = [];
        const ctx = this.plotCtx;

        for (let i = 0; i <= steps && points.length < 10000; i++) {
            const t = tMin + (tMax - tMin) * i / steps;
            const x = fX(t + time);
            const y = fY(t + time);

            if (x >= ctx.xmin && x <= ctx.xmax && y >= ctx.ymin && y <= ctx.ymax) {
                points.push({ x: this.scaleX(x), y: this.scaleY(y) });
            }
        }

        if (points.length > 1) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x, points[0].y);
            
            for (let j = 1; j < points.length; j++) {
                this.ctx.lineTo(points[j].x, points[j].y);
            }
            this.ctx.stroke();
        }
    }

    drawTitle(text, options = {}) {
        const {
            color = this.colors.DARKGRAY,
            fontSize = 32,
            fontFamily = 'Arial'
        } = options;
        
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.width / 2, fontSize + 10);
        this.ctx.textAlign = 'left';
    }

    drawPieChart(centerX, centerY, radius, data, options = {}) {
        const {
            showLabels = true,
            labelColor = this.colors.WHITE,
            labelFontSize = 18
        } = options;

        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;

        let startAngle = -Math.PI / 2;
        
        for (const item of data) {
            const sweepAngle = (item.value / total) * 2 * Math.PI;
            const endAngle = startAngle + sweepAngle;
            
            // Draw slice
            this.ctx.fillStyle = item.color;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw border
            this.ctx.strokeStyle = this.colors.DARKGRAY;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw label
            if (showLabels) {
                const midAngle = startAngle + sweepAngle / 2;
                const labelRadius = radius * 0.7;
                const labelX = centerX + Math.cos(midAngle) * labelRadius;
                const labelY = centerY + Math.sin(midAngle) * labelRadius;
                
                const percent = ((item.value / total) * 100).toFixed(1) + '%';
                this.ctx.fillStyle = labelColor;
                this.ctx.font = `${labelFontSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(percent, labelX, labelY);
            }
            
            startAngle = endAngle;
        }
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }

    drawBarChart(x, y, width, height, data, options = {}) {
        const {
            showValues = true,
            showGrid = true,
            valueColor = this.colors.DARKGRAY
        } = options;

        if (data.length === 0) return;
        
        const maxValue = Math.max(...data.map(item => item.value)) || 1;
        const barWidth = width / data.length * 0.8;
        const spacing = width / data.length * 0.2;
        
        // Draw axes
        this.ctx.strokeStyle = this.colors.DARKGRAY;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + height);
        this.ctx.stroke();
        
        // Draw horizontal grid lines
        if (showGrid) {
            this.ctx.strokeStyle = this.colors.LIGHTGRAY;
            this.ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const lineY = y + height - (height * i / 5);
                this.ctx.beginPath();
                this.ctx.moveTo(x, lineY);
                this.ctx.lineTo(x + width, lineY);
                this.ctx.stroke();
                
                const label = (maxValue * i / 5).toFixed(0);
                this.ctx.fillStyle = this.colors.DARKGRAY;
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(label, x - 10, lineY + 5);
            }
        }
        this.ctx.textAlign = 'left';
        
        // Draw bars
        for (let i = 0; i < data.length; i++) {
            const barX = x + spacing / 2 + i * (barWidth + spacing);
            const barHeight = (data[i].value / maxValue) * height;
            const barY = y + height - barHeight;
            
            this.ctx.fillStyle = data[i].color;
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            this.ctx.strokeStyle = this.colors.DARKGRAY;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // Draw value on top
            if (showValues) {
                const valueText = data[i].value.toFixed(0);
                this.ctx.fillStyle = valueColor;
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(valueText, barX + barWidth / 2, barY - 10);
            }
            
            // Draw label below
            this.ctx.fillText(data[i].label, barX + barWidth / 2, y + height + 25);
        }
    }

    drawLineChart(x, y, width, height, data, options = {}) {
        const {
            showPoints = true,
            showValues = true,
            showGrid = true,
            lineColor = this.colors.BLUE,
            lineWidth = 3
        } = options;

        if (data.length < 2) return;
        
        const maxValue = Math.max(...data.map(item => item.value)) || 1;
        const xStep = width / (data.length - 1);
        
        // Draw axes
        this.ctx.strokeStyle = this.colors.DARKGRAY;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + height);
        this.ctx.stroke();
        
        // Draw horizontal grid lines
        if (showGrid) {
            this.ctx.strokeStyle = this.colors.LIGHTGRAY;
            this.ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const lineY = y + height - (height * i / 5);
                this.ctx.beginPath();
                this.ctx.moveTo(x, lineY);
                this.ctx.lineTo(x + width, lineY);
                this.ctx.stroke();
                
                const label = (maxValue * i / 5).toFixed(0);
                this.ctx.fillStyle = this.colors.DARKGRAY;
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(label, x - 10, lineY + 5);
            }
        }
        this.ctx.textAlign = 'left';
        
        // Draw line
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const pointX = x + i * xStep;
            const pointY = y + height - (data[i].value / maxValue) * height;
            
            if (i === 0) {
                this.ctx.moveTo(pointX, pointY);
            } else {
                this.ctx.lineTo(pointX, pointY);
            }
        }
        this.ctx.stroke();
        
        // Draw points and labels
        if (showPoints) {
            for (let i = 0; i < data.length; i++) {
                const pointX = x + i * xStep;
                const pointY = y + height - (data[i].value / maxValue) * height;
                
                this.ctx.fillStyle = data[i].color;
                this.ctx.beginPath();
                this.ctx.arc(pointX, pointY, 6, 0, 2 * Math.PI);
                this.ctx.fill();
                
                this.ctx.strokeStyle = this.colors.DARKGRAY;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                
                // Draw value above point
                if (showValues) {
                    const valueText = data[i].value.toFixed(0);
                    this.ctx.fillStyle = this.colors.DARKGRAY;
                    this.ctx.font = '16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(valueText, pointX, pointY - 20);
                }
                
                // Draw label below
                this.ctx.fillText(data[i].label, pointX, y + height + 25);
            }
        }
    }
}

export default CanvasPlotLib;
