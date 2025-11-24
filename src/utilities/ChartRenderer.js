// Lightweight canvas chart rendering
const ChartRenderer = (() => {
  class Chart {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = {
        padding: 20,
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
        ...options
      };
      this.data = [];
    }

    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBarChart(data, options = {}) {
      this.clear();
      this.data = data;
      
      const { padding } = this.options;
      const width = this.canvas.width - padding * 2;
      const height = this.canvas.height - padding * 2;
      const barWidth = width / data.length;
      const maxValue = Math.max(...data);

      // Draw bars
      data.forEach((value, index) => {
        const barHeight = (value / maxValue) * height;
        const x = padding + index * barWidth;
        const y = this.canvas.height - padding - barHeight;

        this.ctx.fillStyle = this.options.colors[index % this.options.colors.length];
        this.ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

        // Draw value label
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(value, x + barWidth / 2, y - 5);
      });
    }

    drawLineChart(data, options = {}) {
      this.clear();
      this.data = data;
      
      const { padding } = this.options;
      const width = this.canvas.width - padding * 2;
      const height = this.canvas.height - padding * 2;
      const maxValue = Math.max(...data);
      const pointWidth = width / (data.length - 1);

      this.ctx.strokeStyle = this.options.colors[0];
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      data.forEach((value, index) => {
        const x = padding + index * pointWidth;
        const y = this.canvas.height - padding - (value / maxValue) * height;

        if (index === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      });

      this.ctx.stroke();

      // Draw points
      data.forEach((value, index) => {
        const x = padding + index * pointWidth;
        const y = this.canvas.height - padding - (value / maxValue) * height;

        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = this.options.colors[0];
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      });
    }

    drawPieChart(data, labels, options = {}) {
      this.clear();
      
      const total = data.reduce((sum, value) => sum + value, 0);
      let startAngle = 0;
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const radius = Math.min(centerX, centerY) - this.options.padding;

      data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        this.ctx.fillStyle = this.options.colors[index % this.options.colors.length];
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius / 1.5) * Math.cos(labelAngle);
        const labelY = centerY + (radius / 1.5) * Math.sin(labelAngle);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(labels[index], labelX, labelY);

        startAngle += sliceAngle;
      });
    }
  }

  return {
    create(canvas, options) {
      return new Chart(canvas, options);
    },
    
    // Quick chart methods
    bar(canvas, data, options) {
      const chart = new Chart(canvas, options);
      chart.drawBarChart(data, options);
      return chart;
    },
    
    line(canvas, data, options) {
      const chart = new Chart(canvas, options);
      chart.drawLineChart(data, options);
      return chart;
    },
    
    pie(canvas, data, labels, options) {
      const chart = new Chart(canvas, options);
      chart.drawPieChart(data, labels, options);
      return chart;
    }
  };
})();

export default ChartRenderer
