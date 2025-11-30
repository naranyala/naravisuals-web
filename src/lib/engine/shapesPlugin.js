// shapesPlugin.js — Essential shape primitives for canvas_util.js
// Primitives: circle, rect, line, polygon, text, image

export const shapesPlugin = (app) => {
    app.shapes = {
        // Circle (solid fill + optional stroke)
        circle(x, y, radius, color = '#fff', options = {}) {
            const circle = {
                x, y, radius, color,
                stroke: options.stroke || null,
                lineWidth: options.lineWidth || 1,
                draw(ctx) {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    if (this.stroke) {
                        ctx.lineWidth = this.lineWidth;
                        ctx.strokeStyle = this.stroke;
                        ctx.stroke();
                    }
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.restore();
                }
            };
            return app.root.add(circle);
        },

        // Rectangle
        rect(x, y, width, height, color = '#fff', options = {}) {
            const rect = {
                x, y, width, height, color,
                stroke: options.stroke || null,
                lineWidth: options.lineWidth || 1,
                draw(ctx) {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    if (this.stroke) {
                        ctx.lineWidth = this.lineWidth;
                        ctx.strokeStyle = this.stroke;
                        ctx.strokeRect(0, 0, this.width, this.height);
                    }
                    ctx.fillStyle = this.color;
                    ctx.fillRect(0, 0, this.width, this.height);
                    ctx.restore();
                }
            };
            return app.root.add(rect);
        },

        // Line (with optional arrowhead)
        line(x1, y1, x2, y2, lineWidth = 2, color = '#fff', options = {}) {
            const dx = x2 - x1, dy = y2 - y1;
            const angle = Math.atan2(dy, dx);
            const arrowhead = options.arrowhead ? 10 : 0;

            const line = {
                x1, y1, x2, y2, lineWidth, color,
                draw(ctx) {
                    ctx.save();
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = this.lineWidth;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(this.x1, this.y1);
                    ctx.lineTo(this.x2, this.y2);
                    ctx.stroke();

                    if (arrowhead) {
                        // Arrow tip
                        ctx.beginPath();
                        ctx.moveTo(this.x2, this.y2);
                        ctx.lineTo(this.x2 - arrowhead * Math.cos(angle - 0.3), this.y2 - arrowhead * Math.sin(angle - 0.3));
                        ctx.lineTo(this.x2 - arrowhead * Math.cos(angle + 0.3), this.y2 - arrowhead * Math.sin(angle + 0.3));
                        ctx.closePath();
                        ctx.fillStyle = this.color;
                        ctx.fill();
                    }
                    ctx.restore();
                }
            };
            return app.root.add(line);
        },

        // Polygon (from points array or regular n-sides)
        polygon(x, y, pointsOrSides, color = '#fff', options = {}) {
            let points = pointsOrSides;
            if (typeof pointsOrSides === 'number') {
                const sides = pointsOrSides;
                const radius = options.radius || 50;
                points = [];
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    points.push([
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius
                    ]);
                }
            }

            const poly = {
                x, y, points, color,
                stroke: options.stroke || null,
                lineWidth: options.lineWidth || 1,
                draw(ctx) {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.beginPath();
                    ctx.moveTo(this.points[0][0], this.points[0][1]);
                    for (let i = 1; i < this.points.length; i++) {
                        ctx.lineTo(this.points[i][0], this.points[i][1]);
                    }
                    ctx.closePath();

                    if (this.stroke) {
                        ctx.lineWidth = this.lineWidth;
                        ctx.strokeStyle = this.stroke;
                        ctx.stroke();
                    }
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.restore();
                }
            };
            return app.root.add(poly);
        },

        // Text
        text(text, x, y, font = '24px Arial', color = '#fff', options = {}) {
            const txt = {
                text, x, y, font, color,
                align: options.align || 'left',
                baseline: options.baseline || 'top',
                draw(ctx) {
                    ctx.save();
                    ctx.font = this.font;
                    ctx.fillStyle = this.color;
                    ctx.textAlign = this.align;
                    ctx.textBaseline = this.baseline;
                    ctx.fillText(this.text, this.x, this.y);
                    ctx.restore();
                }
            };
            return app.root.add(txt);
        }
    };

    console.log("🎨 shapesPlugin loaded — circles, lines, polygons, and more now ready!");
}
