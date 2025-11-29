// gridAndRulerPlugin.js — Professional grid system with rulers & coordinate display

export function gridAndRulerPlugin(app) {
    const gridLayer = app.createLayer(-100);  // Behind everything
    const rulerLayer = app.createLayer(100);  // Above most things

    let config = {
        enabled: true,
        gridSize: 50,
        gridColor: "rgba(255, 255, 255, 0.1)",
        majorGridSize: 100,
        majorGridColor: "rgba(255, 255, 255, 0.2)",
        originColor: "#00ffff",
        originSize: 12,
        rulerEnabled: true,
        rulerBgColor: "rgba(20, 20, 40, 0.9)",
        rulerTextColor: "#cccccc",
        rulerLineColor: "#666666",
        coordDisplay: true,
        coordColor: "#00ffaa",
        coordBgColor: "rgba(0, 0, 0, 0.6)",
        coordSize: 14,
    };

    // ——————————————————— Grid Object ———————————————————
    const grid = gridLayer.add({
        draw(ctx) {
            if (!config.enabled) return;

            const { width, height } = app.canvas;
            const offsetX = width / 2 % config.gridSize;
            const offsetY = height / 2 % config.gridSize;

            ctx.strokeStyle = config.gridColor;
            ctx.lineWidth = 1;

            // Minor grid
            ctx.beginPath();
            for (let x = -offsetX; x < width; x += config.gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = -offsetY; y < height; y += config.gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            // Major grid (every N cells)
            if (config.majorGridSize > config.gridSize) {
                ctx.strokeStyle = config.majorGridColor;
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                for (let x = -offsetX; x < width; x += config.majorGridSize) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                }
                for (let y = -offsetY; y < height; y += config.majorGridSize) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                }
                ctx.stroke();
            }

            // Origin cross
            ctx.strokeStyle = config.originColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width / 2 - config.originSize, height / 2);
            ctx.lineTo(width / 2 + config.originSize, height / 2);
            ctx.moveTo(width / 2, height / 2 - config.originSize);
            ctx.lineTo(width / 2, height / 2 + config.originSize);
            ctx.stroke();
        }
    });

    // ——————————————————— Rulers (Top + Left) ———————————————————
    const rulerTop = rulerLayer.add({
        draw(ctx) {
            if (!config.rulerEnabled) return;

            const { width, height } = app.canvas;

            // Top ruler background
            ctx.fillStyle = config.rulerBgColor;
            ctx.fillRect(50, 0, width - 50, 30);

            // Left ruler background
            ctx.fillRect(0, 50, 50, height - 50);

            // Ruler lines and labels
            ctx.fillStyle = config.rulerTextColor;
            ctx.font = "12px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const offsetX = width / 2 % config.gridSize;
            const offsetY = height / 2 % config.gridSize;

            // Top ruler
            for (let x = -offsetX; x < width; x += config.gridSize) {
                if (x >= 50) {
                    const coord = Math.round((x - width / 2) / config.gridSize) * config.gridSize;
                    const isMajor = Math.abs(coord) % config.majorGridSize === 0;

                    ctx.strokeStyle = isMajor ? config.majorGridColor : config.rulerLineColor;
                    ctx.lineWidth = isMajor ? 2 : 1;
                    ctx.beginPath();
                    ctx.moveTo(x, 30);
                    ctx.lineTo(x, isMajor ? 20 : 25);
                    ctx.stroke();

                    if (isMajor || config.gridSize <= 30) {
                        ctx.fillText(coord.toString(), x, 15);
                    }
                }
            }

            // Left ruler
            ctx.save();
            ctx.translate(25, 50);
            ctx.rotate(-Math.PI / 2);
            for (let y = -offsetY; y < height; y += config.gridSize) {
                if (y >= 0) {
                    const coord = Math.round((y - height / 2) / config.gridSize) * config.gridSize;
                    const isMajor = Math.abs(coord) % config.majorGridSize === 0;

                    ctx.strokeStyle = isMajor ? config.majorGridColor : config.rulerLineColor;
                    ctx.lineWidth = isMajor ? 2 : 1;
                    ctx.beginPath();
                    ctx.moveTo(y, 25);
                    ctx.lineTo(y, isMajor ? 15 : 20);
                    ctx.stroke();

                    if (isMajor || config.gridSize <= 30) {
                        ctx.fillText(coord.toString(), y, 0);
                    }
                }
            }
            ctx.restore();
        }
    });

    // ——————————————————— Coordinate Display (follows mouse) ———————————————————
    let coordText = null;

    function updateCoordDisplay() {
        if (!config.coordDisplay) {
            if (coordText) {
                rulerLayer.remove(coordText);
                coordText = null;
            }
            return;
        }

        const worldX = Math.round((app.pointer.x - app.canvas.width / 2) / config.gridSize) * config.gridSize;
        const worldY = Math.round((app.pointer.y - app.canvas.height / 2) / config.gridSize) * config.gridSize;

        if (!coordText) {
            coordText = app.text.basic(0, 0, "", {
                size: config.coordSize,
                color: config.coordColor,
                font: "bold monospace",
                align: "left",
                baseline: "top"
            });
            rulerLayer.add(coordText);
        }

        coordText.message = `X: ${worldX}  Y: ${worldY}`;
        coordText.x = 10;
        coordText.y = 10;

        // Background
        const metrics = app.ctx.measureText(coordText.message);
        coordText.draw = function(ctx) {
            const padding = 8;
            const w = metrics.width + padding * 2;
            const h = config.coordSize + padding;

            ctx.fillStyle = config.coordBgColor;
            ctx.fillRect(-padding, -padding, w, h);

            ctx.fillStyle = this.color;
            ctx.font = `${this.size}px ${this.font}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(this.message, 0, 0);
        };
    }

    // Update every frame
    app.start(function*() {
        while (true) {
            updateCoordDisplay();
            yield;
        }
    });

    // ——————————————————— Public API ———————————————————
    app.grid = {
        show() { config.enabled = true; config.rulerEnabled = true; },
        hide() { config.enabled = false; config.rulerEnabled = false; },
        toggle() { config.enabled = !config.enabled; config.rulerEnabled = config.enabled; },
        setSize(size) { config.gridSize = size; config.majorGridSize = size * 5; },
        setMajorEvery(n) { config.majorGridSize = config.gridSize * n; },

        // Direct config access (advanced)
        config,
        layer: gridLayer,
        rulerLayer,
    };

    // Auto-initialize
    app.grid.setSize(50);
}
