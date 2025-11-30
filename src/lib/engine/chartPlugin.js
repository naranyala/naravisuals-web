// chartPlugin.js — Comprehensive chart plugin for canvas_util

export function chartPlugin(app) {
    const { ctx, lerp } = app;

    // Default chart colors
    const CHART_COLORS = [
        '#4F46E5', '#EC4899', '#10B981', '#F59E0B',
        '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16',
        '#F97316', '#14B8A6', '#A855F7', '#EAB308'
    ];

    // ==========================================
    // Helper Functions
    // ==========================================
    function measureText(text, font = '12px sans-serif') {
        ctx.save();
        ctx.font = font;
        const metrics = ctx.measureText(text);
        ctx.restore();
        return metrics.width;
    }

    function drawGrid(ctx, chartArea, divisions = 5, color = '#E5E7EB') {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (let i = 0; i <= divisions; i++) {
            const yPos = chartArea.y + (chartArea.height / divisions) * i;
            ctx.beginPath();
            ctx.moveTo(chartArea.x, yPos);
            ctx.lineTo(chartArea.x + chartArea.width, yPos);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawAxes(ctx, chartArea, color = '#6B7280', lineWidth = 2) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(chartArea.x, chartArea.y);
        ctx.lineTo(chartArea.x, chartArea.y + chartArea.height);
        ctx.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
        ctx.stroke();
        ctx.restore();
    }

    function drawTitle(ctx, title, x, y) {
        if (!title) return;
        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#1F2937';
        ctx.textAlign = 'center';
        ctx.fillText(title, x, y);
        ctx.restore();
    }

    // ==========================================
    // Line Chart
    // ==========================================
    function createLineChart(config) {
        const {
            data,           // [{label, values: []}]
            x = 0,
            y = 0,
            width = 400,
            height = 300,
            padding = { top: 40, right: 20, bottom: 50, left: 60 },
            xLabels = [],
            yAxisLabel = '',
            xAxisLabel = '',
            title = '',
            colors = CHART_COLORS,
            showGrid = true,
            showPoints = true,
            pointRadius = 4,
            smooth = false,
            animate = true,
            lineWidth = 2.5,
            fillArea = false,
            showLegend = true,
        } = config;

        let animProgress = animate ? 0 : 1;

        const chart = {
            data,
            x,
            y,
            width,
            height,
            padding,
            xLabels,
            yAxisLabel,
            xAxisLabel,
            title,
            colors,
            showGrid,
            showPoints,
            pointRadius,
            smooth,
            lineWidth,
            fillArea,
            showLegend,

            update(dt) {
                if (animate && animProgress < 1) {
                    animProgress = Math.min(1, animProgress + dt / 1000);
                }
            },

            draw(ctx) {
                const chartArea = {
                    x: this.x + this.padding.left,
                    y: this.y + this.padding.top,
                    width: this.width - this.padding.left - this.padding.right,
                    height: this.height - this.padding.top - this.padding.bottom,
                };

                // Find min/max values
                const allValues = this.data.flatMap(d => d.values);
                const maxVal = Math.max(...allValues);
                const minVal = Math.min(...allValues, 0);
                const range = maxVal - minVal || 1;

                drawTitle(ctx, this.title, this.x + this.width / 2, this.y + 20);

                if (this.showGrid) {
                    drawGrid(ctx, chartArea);
                }

                drawAxes(ctx, chartArea);

                // Draw y-axis labels
                ctx.save();
                ctx.fillStyle = '#6B7280';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';

                for (let i = 0; i <= 5; i++) {
                    const value = maxVal - (range / 5) * i;
                    const yPos = chartArea.y + (chartArea.height / 5) * i;
                    ctx.fillText(value.toFixed(1), chartArea.x - 10, yPos);
                }
                ctx.restore();

                // Draw x-axis labels
                if (this.xLabels.length > 0) {
                    ctx.save();
                    ctx.fillStyle = '#6B7280';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';

                    const xStep = chartArea.width / (this.xLabels.length - 1 || 1);
                    this.xLabels.forEach((label, i) => {
                        const xPos = chartArea.x + xStep * i;
                        ctx.fillText(label, xPos, chartArea.y + chartArea.height + 10);
                    });
                    ctx.restore();
                }

                // Draw axis labels
                if (this.yAxisLabel) {
                    ctx.save();
                    ctx.fillStyle = '#374151';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.translate(this.x + 15, this.y + this.height / 2);
                    ctx.rotate(-Math.PI / 2);
                    ctx.textAlign = 'center';
                    ctx.fillText(this.yAxisLabel, 0, 0);
                    ctx.restore();
                }

                if (this.xAxisLabel) {
                    ctx.save();
                    ctx.fillStyle = '#374151';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.xAxisLabel, this.x + this.width / 2, this.y + this.height - 10);
                    ctx.restore();
                }

                // Draw data lines
                this.data.forEach((series, seriesIdx) => {
                    const color = this.colors[seriesIdx % this.colors.length];
                    const numPoints = series.values.length;
                    const xStep = chartArea.width / (numPoints - 1 || 1);

                    // Fill area under line
                    if (this.fillArea) {
                        ctx.save();
                        ctx.fillStyle = color + '30'; // Add transparency
                        ctx.beginPath();

                        series.values.forEach((value, i) => {
                            if (i / numPoints > animProgress) return;

                            const xPos = chartArea.x + xStep * i;
                            const yRatio = (value - minVal) / range;
                            const yPos = chartArea.y + chartArea.height - (yRatio * chartArea.height);

                            if (i === 0) {
                                ctx.moveTo(xPos, chartArea.y + chartArea.height);
                                ctx.lineTo(xPos, yPos);
                            } else {
                                ctx.lineTo(xPos, yPos);
                            }
                        });

                        ctx.lineTo(chartArea.x + xStep * (numPoints - 1), chartArea.y + chartArea.height);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }

                    // Draw line
                    ctx.save();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = this.lineWidth;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    ctx.beginPath();
                    series.values.forEach((value, i) => {
                        const xPos = chartArea.x + xStep * i;
                        const yRatio = (value - minVal) / range;
                        const yPos = chartArea.y + chartArea.height - (yRatio * chartArea.height);

                        if (i === 0) {
                            ctx.moveTo(xPos, yPos);
                        } else {
                            if (this.smooth) {
                                const prevX = chartArea.x + xStep * (i - 1);
                                const prevValue = series.values[i - 1];
                                const prevYRatio = (prevValue - minVal) / range;
                                const prevY = chartArea.y + chartArea.height - (prevYRatio * chartArea.height);

                                const cpX = (prevX + xPos) / 2;
                                ctx.quadraticCurveTo(cpX, prevY, xPos, yPos);
                            } else {
                                ctx.lineTo(xPos, yPos);
                            }
                        }

                        if (i / numPoints > animProgress) return;
                    });
                    ctx.stroke();
                    ctx.restore();

                    // Draw points
                    if (this.showPoints) {
                        ctx.save();
                        ctx.fillStyle = color;
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 2;

                        series.values.forEach((value, i) => {
                            if (i / numPoints > animProgress) return;

                            const xPos = chartArea.x + xStep * i;
                            const yRatio = (value - minVal) / range;
                            const yPos = chartArea.y + chartArea.height - (yRatio * chartArea.height);

                            ctx.beginPath();
                            ctx.arc(xPos, yPos, this.pointRadius, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.stroke();
                        });
                        ctx.restore();
                    }
                });

                // Draw legend
                if (this.showLegend && this.data.length > 1) {
                    ctx.save();
                    let legendX = chartArea.x + chartArea.width - 10;
                    let legendY = chartArea.y + 10;

                    this.data.forEach((series, idx) => {
                        const color = this.colors[idx % this.colors.length];
                        ctx.textAlign = 'right';
                        ctx.fillStyle = '#374151';
                        ctx.font = '12px sans-serif';
                        ctx.fillText(series.label, legendX, legendY);

                        ctx.fillStyle = color;
                        ctx.fillRect(legendX + 5, legendY - 8, 20, 12);

                        legendY += 20;
                    });
                    ctx.restore();
                }
            },
        };

        return chart;
    }

    // ==========================================
    // Bar Chart
    // ==========================================
    function createBarChart(config) {
        const {
            data,           // [{label, value, color?}]
            x = 0,
            y = 0,
            width = 400,
            height = 300,
            padding = { top: 40, right: 20, bottom: 60, left: 60 },
            yAxisLabel = '',
            xAxisLabel = '',
            title = '',
            colors = CHART_COLORS,
            horizontal = false,
            animate = true,
            showValues = false,
            grouped = false,    // for grouped bar charts
            stacked = false,    // for stacked bar charts
        } = config;

        let animProgress = animate ? 0 : 1;

        const chart = {
            data,
            x,
            y,
            width,
            height,
            padding,
            yAxisLabel,
            xAxisLabel,
            title,
            colors,
            horizontal,
            showValues,
            grouped,
            stacked,

            update(dt) {
                if (animate && animProgress < 1) {
                    animProgress = Math.min(1, animProgress + dt / 1000);
                }
            },

            draw(ctx) {
                const chartArea = {
                    x: this.x + this.padding.left,
                    y: this.y + this.padding.top,
                    width: this.width - this.padding.left - this.padding.right,
                    height: this.height - this.padding.top - this.padding.bottom,
                };

                const maxVal = Math.max(...this.data.map(d =>
                    typeof d.value === 'number' ? d.value : Math.max(...d.values)
                ));
                const barCount = this.data.length;

                drawTitle(ctx, this.title, this.x + this.width / 2, this.y + 20);
                drawAxes(ctx, chartArea);

                if (!this.horizontal) {
                    // Vertical bars
                    const barWidth = chartArea.width / barCount * 0.8;
                    const barSpacing = chartArea.width / barCount;

                    // Draw y-axis labels
                    ctx.save();
                    ctx.fillStyle = '#6B7280';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'middle';

                    for (let i = 0; i <= 5; i++) {
                        const value = maxVal - (maxVal / 5) * i;
                        const yPos = chartArea.y + (chartArea.height / 5) * i;
                        ctx.fillText(value.toFixed(0), chartArea.x - 10, yPos);
                    }
                    ctx.restore();

                    // Draw bars
                    this.data.forEach((item, i) => {
                        const color = item.color || this.colors[i % this.colors.length];
                        const value = typeof item.value === 'number' ? item.value : item.values[0];
                        const barHeight = (value / maxVal) * chartArea.height * animProgress;
                        const xPos = chartArea.x + barSpacing * i + (barSpacing - barWidth) / 2;
                        const yPos = chartArea.y + chartArea.height - barHeight;

                        ctx.save();
                        ctx.fillStyle = color;
                        ctx.fillRect(xPos, yPos, barWidth, barHeight);

                        // Draw border
                        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(xPos, yPos, barWidth, barHeight);
                        ctx.restore();

                        // Draw value on top
                        if (this.showValues) {
                            ctx.save();
                            ctx.fillStyle = '#374151';
                            ctx.font = 'bold 11px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.fillText(value.toFixed(1), xPos + barWidth / 2, yPos - 5);
                            ctx.restore();
                        }

                        // Draw label
                        ctx.save();
                        ctx.fillStyle = '#374151';
                        ctx.font = '12px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';

                        // Wrap text if too long
                        const maxLabelWidth = barWidth;
                        const words = item.label.split(' ');
                        let line = '';
                        let lineY = chartArea.y + chartArea.height + 10;

                        words.forEach((word, idx) => {
                            const testLine = line + word + ' ';
                            const metrics = ctx.measureText(testLine);

                            if (metrics.width > maxLabelWidth && idx > 0) {
                                ctx.fillText(line, xPos + barWidth / 2, lineY);
                                line = word + ' ';
                                lineY += 14;
                            } else {
                                line = testLine;
                            }
                        });
                        ctx.fillText(line, xPos + barWidth / 2, lineY);
                        ctx.restore();
                    });
                } else {
                    // Horizontal bars
                    const barHeight = chartArea.height / barCount * 0.8;
                    const barSpacing = chartArea.height / barCount;

                    this.data.forEach((item, i) => {
                        const color = item.color || this.colors[i % this.colors.length];
                        const value = typeof item.value === 'number' ? item.value : item.values[0];
                        const barW = (value / maxVal) * chartArea.width * animProgress;
                        const yPos = chartArea.y + barSpacing * i + (barSpacing - barHeight) / 2;

                        ctx.save();
                        ctx.fillStyle = color;
                        ctx.fillRect(chartArea.x, yPos, barW, barHeight);

                        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(chartArea.x, yPos, barW, barHeight);
                        ctx.restore();

                        if (this.showValues) {
                            ctx.save();
                            ctx.fillStyle = '#374151';
                            ctx.font = 'bold 11px sans-serif';
                            ctx.textAlign = 'left';
                            ctx.fillText(value.toFixed(1), chartArea.x + barW + 5, yPos + barHeight / 2);
                            ctx.restore();
                        }

                        // Draw label
                        ctx.save();
                        ctx.fillStyle = '#374151';
                        ctx.font = '12px sans-serif';
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(item.label, chartArea.x - 10, yPos + barHeight / 2);
                        ctx.restore();
                    });
                }
            },
        };

        return chart;
    }

    // ==========================================
    // Pie/Donut Chart
    // ==========================================
    function createPieChart(config) {
        const {
            data,           // [{label, value, color?}]
            x = 0,
            y = 0,
            radius = 100,
            innerRadius = 0,  // > 0 for donut chart
            title = '',
            colors = CHART_COLORS,
            showLabels = true,
            showPercentages = true,
            showLegend = true,
            animate = true,
            startAngle = -Math.PI / 2,
        } = config;

        let animProgress = animate ? 0 : 1;

        const chart = {
            data,
            x,
            y,
            radius,
            innerRadius,
            title,
            colors,
            showLabels,
            showPercentages,
            showLegend,
            startAngle,

            update(dt) {
                if (animate && animProgress < 1) {
                    animProgress = Math.min(1, animProgress + dt / 1000);
                }
            },

            draw(ctx) {
                const total = this.data.reduce((sum, d) => sum + d.value, 0);
                let currentAngle = this.startAngle;

                drawTitle(ctx, this.title, this.x, this.y - this.radius - 20);

                // Draw slices
                this.data.forEach((item, i) => {
                    const sliceAngle = (item.value / total) * Math.PI * 2 * animProgress;
                    const color = item.color || this.colors[i % this.colors.length];

                    ctx.save();
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);

                    if (this.innerRadius > 0) {
                        // Donut chart
                        ctx.arc(this.x, this.y, this.radius, currentAngle, currentAngle + sliceAngle);
                        ctx.arc(this.x, this.y, this.innerRadius, currentAngle + sliceAngle, currentAngle, true);
                    } else {
                        // Pie chart
                        ctx.arc(this.x, this.y, this.radius, currentAngle, currentAngle + sliceAngle);
                    }

                    ctx.closePath();
                    ctx.fill();

                    // Draw border
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();

                    // Draw label
                    if (this.showLabels && animProgress > 0.8) {
                        const labelAngle = currentAngle + sliceAngle / 2;
                        const labelRadius = (this.radius + this.innerRadius) / 2;
                        const labelX = this.x + Math.cos(labelAngle) * labelRadius;
                        const labelY = this.y + Math.sin(labelAngle) * labelRadius;

                        ctx.save();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = 'bold 12px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        ctx.shadowBlur = 3;
                        ctx.fillText(item.label, labelX, labelY);

                        if (this.showPercentages) {
                            const percent = ((item.value / total) * 100).toFixed(1);
                            ctx.font = '10px sans-serif';
                            ctx.fillText(`${percent}%`, labelX, labelY + 15);
                        }
                        ctx.restore();
                    }

                    currentAngle += sliceAngle;
                });

                // Draw center value for donut
                if (this.innerRadius > 0) {
                    ctx.save();
                    ctx.fillStyle = '#1F2937';
                    ctx.font = 'bold 24px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(total.toFixed(0), this.x, this.y - 5);

                    ctx.font = '12px sans-serif';
                    ctx.fillStyle = '#6B7280';
                    ctx.fillText('Total', this.x, this.y + 15);
                    ctx.restore();
                }

                // Draw legend
                if (this.showLegend) {
                    ctx.save();
                    let legendY = this.y - this.radius + 20;
                    const legendX = this.x + this.radius + 30;

                    this.data.forEach((item, i) => {
                        const color = item.color || this.colors[i % this.colors.length];

                        ctx.fillStyle = color;
                        ctx.fillRect(legendX, legendY - 8, 15, 15);

                        ctx.fillStyle = '#374151';
                        ctx.font = '12px sans-serif';
                        ctx.textAlign = 'left';
                        ctx.fillText(item.label, legendX + 20, legendY);

                        const percent = ((item.value / total) * 100).toFixed(1);
                        ctx.font = '11px sans-serif';
                        ctx.fillStyle = '#6B7280';
                        ctx.fillText(`${percent}%`, legendX + 20, legendY + 14);

                        legendY += 35;
                    });
                    ctx.restore();
                }
            },
        };

        return chart;
    }

    // ==========================================
    // Scatter Plot
    // ==========================================
    function createScatterPlot(config) {
        const {
            data,           // [{x, y, label?, color?, size?}]
            x = 0,
            y = 0,
            width = 400,
            height = 300,
            padding = { top: 40, right: 20, bottom: 50, left: 60 },
            xAxisLabel = '',
            yAxisLabel = '',
            title = '',
            colors = CHART_COLORS,
            defaultSize = 5,
            showGrid = true,
            animate = true,
        } = config;

        let animProgress = animate ? 0 : 1;

        const chart = {
            data,
            x,
            y,
            width,
            height,
            padding,
            xAxisLabel,
            yAxisLabel,
            title,
            colors,
            defaultSize,
            showGrid,

            update(dt) {
                if (animate && animProgress < 1) {
                    animProgress = Math.min(1, animProgress + dt / 1000);
                }
            },

            draw(ctx) {
                const chartArea = {
                    x: this.x + this.padding.left,
                    y: this.y + this.padding.top,
                    width: this.width - this.padding.left - this.padding.right,
                    height: this.height - this.padding.top - this.padding.bottom,
                };

                const xValues = this.data.map(d => d.x);
                const yValues = this.data.map(d => d.y);
                const xMin = Math.min(...xValues);
                const xMax = Math.max(...xValues);
                const yMin = Math.min(...yValues);
                const yMax = Math.max(...yValues);

                drawTitle(ctx, this.title, this.x + this.width / 2, this.y + 20);

                if (this.showGrid) {
                    drawGrid(ctx, chartArea);
                }

                drawAxes(ctx, chartArea);

                // Draw axis labels
                ctx.save();
                ctx.fillStyle = '#6B7280';
                ctx.font = '12px sans-serif';

                // Y-axis
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                for (let i = 0; i <= 5; i++) {
                    const value = yMax - ((yMax - yMin) / 5) * i;
                    const yPos = chartArea.y + (chartArea.height / 5) * i;
                    ctx.fillText(value.toFixed(1), chartArea.x - 10, yPos);
                }

                // X-axis
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                for (let i = 0; i <= 5; i++) {
                    const value = xMin + ((xMax - xMin) / 5) * i;
                    const xPos = chartArea.x + (chartArea.width / 5) * i;
                    ctx.fillText(value.toFixed(1), xPos, chartArea.y + chartArea.height + 10);
                }
                ctx.restore();

                // Draw points
                this.data.forEach((point, idx) => {
                    if (idx / this.data.length > animProgress) return;

                    const xPos = chartArea.x + ((point.x - xMin) / (xMax - xMin)) * chartArea.width;
                    const yPos = chartArea.y + chartArea.height - ((point.y - yMin) / (yMax - yMin)) * chartArea.height;
                    const size = point.size || this.defaultSize;
                    const color = point.color || this.colors[idx % this.colors.length];

                    ctx.save();
                    ctx.fillStyle = color;
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(xPos, yPos, size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();

                    // Draw label if exists
                    if (point.label) {
                        ctx.save();
                        ctx.fillStyle = '#374151';
                        ctx.font = '10px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(point.label, xPos, yPos - size - 5);
                        ctx.restore();
                    }
                });
            },
        };

        return chart;
    }

    // ==========================================
    // Add chart methods to app
    // ==========================================
    app.createLineChart = createLineChart;
    app.createBarChart = createBarChart;
    app.createPieChart = createPieChart;
    app.createScatterPlot = createScatterPlot;
    app.CHART_COLORS = CHART_COLORS;
}
