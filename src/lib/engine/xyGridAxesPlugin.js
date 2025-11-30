// xyGridAxesPlugin.js — Enhanced XY Grid & Axes System

export function xyGridAxesPlugin(app) {
    let gridList = {}

    // =============================================
    // Grid System
    // =============================================
    app.xyGrid = function(config = {}) {
        const {
            step = 50,
            color = '#333333',
            lineWidth = 1,
            labels = true,
            font = '10px monospace',
            labelColor = '#666666',
            axes = true,
            subDivisions = 0,
            subColor = '#22222222',
            visible = true,
            snapToGrid = false
        } = config;

        const grid = app.root.add({
            visible,
            step,
            color,
            lineWidth,
            labels,
            font,
            labelColor,
            axes,
            subDivisions,
            subColor,
            snapToGrid,

            // Grid snapping utility
            snap(x, y) {
                if (!this.snapToGrid) return app.vec2(x, y);
                return app.vec2(
                    Math.round(x / this.step) * this.step,
                    Math.round(y / this.step) * this.step
                );
            },

            // World to grid coordinates
            worldToGrid(x, y) {
                return app.vec2(
                    Math.floor(x / this.step),
                    Math.floor(y / this.step)
                );
            },

            // Grid to world coordinates
            gridToWorld(gridX, gridY) {
                return app.vec2(
                    gridX * this.step,
                    gridY * this.step
                );
            },

            draw(ctx) {
                if (!this.visible) return;

                const w = app.canvas.width, h = app.canvas.height;

                // Subdivisions (lighter and thinner)
                if (this.subDivisions > 0) {
                    ctx.strokeStyle = this.subColor;
                    ctx.lineWidth = this.lineWidth * 0.5;
                    const subStep = this.step / (this.subDivisions + 1);

                    // Vertical sub-lines
                    for (let x = subStep; x <= w; x += subStep) {
                        if (Math.abs(x % this.step) > 0.1) { // Avoid main grid lines
                            ctx.beginPath();
                            ctx.moveTo(x, 0);
                            ctx.lineTo(x, h);
                            ctx.stroke();
                        }
                    }

                    // Horizontal sub-lines
                    for (let y = subStep; y <= h; y += subStep) {
                        if (Math.abs(y % this.step) > 0.1) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(w, y);
                            ctx.stroke();
                        }
                    }
                }

                // Main grid lines
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;
                ctx.font = this.font;
                ctx.fillStyle = this.labelColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Vertical lines
                for (let x = 0; x <= w; x += this.step) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.stroke();

                    // Labels
                    if (this.labels && x !== 0) {
                        ctx.fillText(x.toString(), x, 10);
                    }
                }

                // Horizontal lines
                for (let y = 0; y <= h; y += this.step) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();

                    // Labels
                    if (this.labels && y !== 0) {
                        ctx.fillText(y.toString(), 10, y);
                    }
                }

                // Coordinate axes (bold)
                if (this.axes) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;

                    // X-axis
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(w, 0);
                    ctx.moveTo(0, h);
                    ctx.lineTo(w, h);
                    ctx.stroke();

                    // Y-axis
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, h);
                    ctx.moveTo(w, 0);
                    ctx.lineTo(w, h);
                    ctx.stroke();

                    // Origin marker
                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath();
                    ctx.arc(0, 0, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillText('(0,0)', 15, -15);
                }
            }
        });

        return grid;
    };

    // =============================================
    // Cartesian Axes System
    // =============================================
    gridList.cartesian = function(config = {}) {
        const {
            centerX = app.canvas.width / 2,
            centerY = app.canvas.height / 2,
            scale = 40,
            color = '#000000',
            lineWidth = 2,
            tickSize = 6,
            tickStep = 1,
            labels = true,
            font = '12px Arial',
            labelColor = '#333333',
            visible = true,
            showOrigin = true
        } = config;

        const axes = app.root.add({
            visible,
            centerX,
            centerY,
            scale,
            color,
            lineWidth,
            tickSize,
            tickStep,
            labels,
            font,
            labelColor,
            showOrigin,

            // Coordinate conversion methods
            toWorld(screenX, screenY) {
                return app.vec2(
                    (screenX - this.centerX) / this.scale,
                    (this.centerY - screenY) / this.scale
                );
            },

            toScreen(worldX, worldY) {
                return app.vec2(
                    worldX * this.scale + this.centerX,
                    this.centerY - worldY * this.scale
                );
            },

            // Snap to tick coordinates
            snapToTick(worldX, worldY) {
                return app.vec2(
                    Math.round(worldX / this.tickStep) * this.tickStep,
                    Math.round(worldY / this.tickStep) * this.tickStep
                );
            },

            draw(ctx) {
                if (!this.visible) return;

                const w = app.canvas.width, h = app.canvas.height;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;
                ctx.font = this.font;
                ctx.fillStyle = this.labelColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // X-axis
                ctx.beginPath();
                ctx.moveTo(0, this.centerY);
                ctx.lineTo(w, this.centerY);
                ctx.stroke();

                // Y-axis
                ctx.beginPath();
                ctx.moveTo(this.centerX, 0);
                ctx.lineTo(this.centerX, h);
                ctx.stroke();

                // X-axis ticks and labels
                const xStart = -Math.floor(this.centerX / this.scale / this.tickStep) * this.tickStep;
                const xEnd = Math.floor((w - this.centerX) / this.scale / this.tickStep) * this.tickStep;

                for (let x = xStart; x <= xEnd; x += this.tickStep) {
                    if (Math.abs(x) < 1e-9) continue; // Skip origin (handled separately)

                    const screenX = x * this.scale + this.centerX;

                    // Tick mark
                    ctx.beginPath();
                    ctx.moveTo(screenX, this.centerY - this.tickSize);
                    ctx.lineTo(screenX, this.centerY + this.tickSize);
                    ctx.stroke();

                    // Label
                    if (this.labels) {
                        ctx.fillText(x.toString(), screenX, this.centerY + 20);
                    }
                }

                // Y-axis ticks and labels
                const yStart = -Math.floor((h - this.centerY) / this.scale / this.tickStep) * this.tickStep;
                const yEnd = Math.floor(this.centerY / this.scale / this.tickStep) * this.tickStep;

                for (let y = yStart; y <= yEnd; y += this.tickStep) {
                    if (Math.abs(y) < 1e-9) continue; // Skip origin

                    const screenY = this.centerY - y * this.scale;

                    // Tick mark
                    ctx.beginPath();
                    ctx.moveTo(this.centerX - this.tickSize, screenY);
                    ctx.lineTo(this.centerX + this.tickSize, screenY);
                    ctx.stroke();

                    // Label
                    if (this.labels) {
                        ctx.fillText(y.toString(), this.centerX - 20, screenY);
                    }
                }

                // Origin marker
                if (this.showOrigin) {
                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath();
                    ctx.arc(this.centerX, this.centerY, 3, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = this.labelColor;
                    ctx.textAlign = 'left';
                    ctx.fillText('(0,0)', this.centerX + 8, this.centerY - 8);
                }

                // Axis labels
                if (this.labels) {
                    ctx.fillStyle = this.color;
                    ctx.textAlign = 'right';
                    ctx.fillText('x', w - 10, this.centerY - 15);
                    ctx.textAlign = 'left';
                    ctx.fillText('y', this.centerX + 15, 15);
                }
            }
        });

        return axes;
    };

    // =============================================
    // Polar Grid System
    // =============================================
    gridList.polar = function(config = {}) {
        const {
            centerX = app.canvas.width / 2,
            centerY = app.canvas.height / 2,
            maxRadius = Math.min(app.canvas.width, app.canvas.height) / 2,
            radialStep = 50,
            angularStep = 30, // degrees
            color = '#333333',
            lineWidth = 1,
            labels = true,
            font = '10px Arial',
            labelColor = '#666666',
            visible = true
        } = config;

        const grid = app.root.add({
            visible,
            centerX,
            centerY,
            maxRadius,
            radialStep,
            angularStep: app.math.degToRad(angularStep),
            color,
            lineWidth,
            labels,
            font,
            labelColor,

            // Convert polar to Cartesian
            polarToCartesian(radius, angle) {
                return app.vec2(
                    radius * Math.cos(angle) + this.centerX,
                    radius * Math.sin(angle) + this.centerY
                );
            },

            draw(ctx) {
                if (!this.visible) return;

                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;
                ctx.font = this.font;
                ctx.fillStyle = this.labelColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Concentric circles
                for (let r = this.radialStep; r <= this.maxRadius; r += this.radialStep) {
                    ctx.beginPath();
                    ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
                    ctx.stroke();

                    // Radius labels
                    if (this.labels) {
                        ctx.fillText(r.toString(), this.centerX + r, this.centerY);
                    }
                }

                // Radial lines (angles)
                for (let angle = 0; angle < Math.PI * 2; angle += this.angularStep) {
                    const end = this.polarToCartesian(this.maxRadius, angle);

                    ctx.beginPath();
                    ctx.moveTo(this.centerX, this.centerY);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();

                    // Angle labels
                    if (this.labels) {
                        const labelPos = this.polarToCartesian(this.maxRadius + 20, angle);
                        const deg = Math.round(app.math.radToDeg(angle));
                        ctx.fillText(`${deg}°`, labelPos.x, labelPos.y);
                    }
                }
            }
        });

        return grid;
    };

    // =============================================
    // Isometric Grid
    // =============================================
    gridList.isometric = function(config = {}) {
        const {
            cellSize = 50,
            color = '#333333',
            lineWidth = 1,
            visible = true
        } = config;

        const grid = app.root.add({
            visible,
            cellSize,
            color,
            lineWidth,

            // Convert isometric to screen coordinates
            isoToScreen(isoX, isoY) {
                return app.vec2(
                    (isoX - isoY) * this.cellSize,
                    (isoX + isoY) * this.cellSize * 0.5
                );
            },

            // Convert screen to isometric coordinates
            screenToIso(screenX, screenY) {
                return app.vec2(
                    (screenX / this.cellSize + screenY / (this.cellSize * 0.5)) * 0.5,
                    (screenY / (this.cellSize * 0.5) - screenX / this.cellSize) * 0.5
                );
            },

            draw(ctx) {
                if (!this.visible) return;

                const w = app.canvas.width, h = app.canvas.height;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;

                // Draw isometric grid lines
                const cellsX = Math.ceil(w / this.cellSize) + 1;
                const cellsY = Math.ceil(h / (this.cellSize * 0.5)) + 1;

                // Lines with positive slope
                for (let i = -cellsX; i <= cellsX; i++) {
                    const start = this.isoToScreen(i, -cellsY);
                    const end = this.isoToScreen(i, cellsY);

                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                }

                // Lines with negative slope
                for (let i = -cellsY; i <= cellsY; i++) {
                    const start = this.isoToScreen(-cellsX, i);
                    const end = this.isoToScreen(cellsX, i);

                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                }
            }
        });

        return grid;
    };



    // =============================================
    // Hexagonal Grid (for games)
    // =============================================
    gridList.hexagonal = function(config = {}) {
        const {
            size = 40,
            color = '#333333',
            lineWidth = 1,
            visible = true,
            flatTop = true
        } = config;

        const grid = app.root.add({
            visible,
            size,
            color,
            lineWidth,
            flatTop,

            // Convert hex coordinates to pixel coordinates
            hexToPixel(q, r) {
                const x = this.size * (3 / 2 * q);
                const y = this.size * (Math.sqrt(3) * (r + q / 2));

                if (this.flatTop) {
                    return app.vec2(
                        this.size * (Math.sqrt(3) * (q + r / 2)),
                        this.size * (3 / 2 * r)
                    );
                }
                return app.vec2(x, y);
            },

            // Convert pixel coordinates to hex coordinates
            pixelToHex(x, y) {
                if (this.flatTop) {
                    const q = (x * Math.sqrt(3) / 3 - y / 3) / this.size;
                    const r = y * 2 / 3 / this.size;
                    return this.roundHex(q, r);
                } else {
                    const q = (x * 2 / 3) / this.size;
                    const r = (-x / 3 + Math.sqrt(3) / 3 * y) / this.size;
                    return this.roundHex(q, r);
                }
            },

            roundHex(q, r) {
                const s = -q - r;
                let rq = Math.round(q);
                let rr = Math.round(r);
                const rs = Math.round(s);

                const qDiff = Math.abs(rq - q);
                const rDiff = Math.abs(rr - r);
                const sDiff = Math.abs(rs - s);

                if (qDiff > rDiff && qDiff > sDiff) {
                    rq = -rr - rs;
                } else if (rDiff > sDiff) {
                    rr = -rq - rs;
                }

                return { q: rq, r: rr };
            },

            draw(ctx) {
                if (!this.visible) return;

                const w = app.canvas.width, h = app.canvas.height;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;

                // Calculate grid bounds
                const hexRadius = this.size;
                const cols = Math.ceil(w / (hexRadius * 1.5)) + 1;
                const rows = Math.ceil(h / (hexRadius * Math.sqrt(3))) + 1;

                for (let q = -cols; q <= cols; q++) {
                    for (let r = -rows; r <= rows; r++) {
                        const center = this.hexToPixel(q, r);

                        ctx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const angle = 2 * Math.PI / 6 * i + (this.flatTop ? 0 : Math.PI / 6);
                            const x = center.x + hexRadius * Math.cos(angle);
                            const y = center.y + hexRadius * Math.sin(angle);

                            if (i === 0) {
                                ctx.moveTo(x, y);
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
        });

        return grid;
    };

    // =============================================
    // Dot Grid (for sketching and design)
    // =============================================
    gridList.dot = function(config = {}) {
        const {
            spacing = 20,
            dotSize = 1.5,
            color = '#cccccc',
            visible = true,
            majorDotSpacing = 5, // Every Nth dot is larger
            majorDotSize = 3,
            majorDotColor = '#999999'
        } = config;

        const grid = app.root.add({
            visible,
            spacing,
            dotSize,
            color,
            majorDotSpacing,
            majorDotSize,
            majorDotColor,

            draw(ctx) {
                if (!this.visible) return;

                const w = app.canvas.width, h = app.canvas.height;

                for (let x = 0; x <= w; x += this.spacing) {
                    for (let y = 0; y <= h; y += this.spacing) {
                        const isMajor = (x / this.spacing) % this.majorDotSpacing === 0 &&
                            (y / this.spacing) % this.majorDotSpacing === 0;

                        ctx.fillStyle = isMajor ? this.majorDotColor : this.color;
                        const size = isMajor ? this.majorDotSize : this.dotSize;

                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        });

        return grid;
    };

    // =============================================
    // Perspective Grid (3D-like)
    // =============================================
    gridList.perspective = function(config = {}) {
        const {
            horizon = app.canvas.height * 0.3,
            vanishingPointX = app.canvas.width / 2,
            color = '#333333',
            lineWidth = 1,
            visible = true,
            spacing = 50
        } = config;

        const grid = app.root.add({
            visible,
            horizon,
            vanishingPointX,
            color,
            lineWidth,
            spacing,

            draw(ctx) {
                if (!this.visible) return;

                const w = app.canvas.width, h = app.canvas.height;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;

                // Horizontal lines (converging to vanishing point)
                for (let y = this.horizon; y <= h; y += this.spacing) {
                    const t = (y - this.horizon) / (h - this.horizon);
                    const startX = this.vanishingPointX - w * t;
                    const endX = this.vanishingPointX + w * t;

                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }

                // Vertical lines (radiating from vanishing point)
                for (let x = 0; x <= w; x += this.spacing) {
                    const dx = x - this.vanishingPointX;
                    const startY = this.horizon;
                    const endY = h;

                    ctx.beginPath();
                    ctx.moveTo(this.vanishingPointX + dx * 0.1, startY);
                    ctx.lineTo(this.vanishingPointX + dx, endY);
                    ctx.stroke();
                }

                // Horizon line
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, this.horizon);
                ctx.lineTo(w, this.horizon);
                ctx.stroke();
            }
        });

        return grid;
    };

    // =============================================
    // Radial Grid (circular patterns)
    // =============================================
    gridList.radial = function(config = {}) {
        const {
            centerX = app.canvas.width / 2,
            centerY = app.canvas.height / 2,
            maxRadius = Math.min(app.canvas.width, app.canvas.height) / 2,
            radialDivisions = 8,
            angularDivisions = 12,
            color = '#333333',
            lineWidth = 1,
            visible = true
        } = config;

        const grid = app.root.add({
            visible,
            centerX,
            centerY,
            maxRadius,
            radialDivisions,
            angularDivisions,
            color,
            lineWidth,

            draw(ctx) {
                if (!this.visible) return;

                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;

                // Concentric circles
                for (let i = 1; i <= this.radialDivisions; i++) {
                    const radius = (this.maxRadius / this.radialDivisions) * i;
                    ctx.beginPath();
                    ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Radial lines
                for (let i = 0; i < this.angularDivisions; i++) {
                    const angle = (Math.PI * 2 / this.angularDivisions) * i;
                    const endX = this.centerX + Math.cos(angle) * this.maxRadius;
                    const endY = this.centerY + Math.sin(angle) * this.maxRadius;

                    ctx.beginPath();
                    ctx.moveTo(this.centerX, this.centerY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        });

        return grid;
    };


    // =============================================
    // Enhanced Coordinate Display
    // =============================================
    app.coordinateDisplay = function(config = {}) {
        const {
            x = 10,
            y = 10,
            font = '14px monospace',
            color = '#000000',
            backgroundColor = '#ffffff88',
            padding = 8,
            visible = true,
            showScreenCoords = true,
            showWorldCoords = false,
            axesSystem = null
        } = config;

        const display = app.root.add({
            visible,
            x,
            y,
            font,
            color,
            backgroundColor,
            padding,
            showScreenCoords,
            showWorldCoords,
            axesSystem,

            screenX: 0,
            screenY: 0,
            worldX: 0,
            worldY: 0,

            updateCoords(screenX, screenY) {
                this.screenX = screenX;
                this.screenY = screenY;

                if (this.axesSystem) {
                    const world = this.axesSystem.toWorld(screenX, screenY);
                    this.worldX = world.x;
                    this.worldY = world.y;
                }
            },

            draw(ctx) {
                if (!this.visible) return;

                let text = '';
                if (this.showScreenCoords) {
                    text += `Screen: (${Math.round(this.screenX)}, ${Math.round(this.screenY)})`;
                }
                if (this.showWorldCoords && this.axesSystem) {
                    if (text) text += '\n';
                    text += `World: (${this.worldX.toFixed(2)}, ${this.worldY.toFixed(2)})`;
                }

                if (!text) return;

                ctx.save();
                ctx.font = this.font;
                ctx.fillStyle = this.backgroundColor;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;

                const lines = text.split('\n');
                const lineHeight = parseInt(this.font) || 14;
                const width = Math.max(...lines.map(line => ctx.measureText(line).width));
                const height = lines.length * lineHeight;

                // Background
                ctx.fillRect(
                    this.x - this.padding,
                    this.y - this.padding,
                    width + this.padding * 2,
                    height + this.padding * 2
                );

                // Border
                ctx.strokeRect(
                    this.x - this.padding,
                    this.y - this.padding,
                    width + this.padding * 2,
                    height + this.padding * 2
                );

                // Text
                ctx.fillStyle = this.color;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';

                lines.forEach((line, i) => {
                    ctx.fillText(line, this.x, this.y + i * lineHeight);
                });

                ctx.restore();
            }
        });

        app.gridList = gridList

        // Auto-update with pointer
        app.root.add({
            update() {
                display.updateCoords(app.pointer.x, app.pointer.y);
            }
        });

        return display;
    };

    console.log("🎯 xyGridAxesPlugin loaded — Complete grid and axes system with Cartesian, polar, isometric, logarithmic, hexagonal, dot, perspective, and radial grids!");
}
