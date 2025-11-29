
// shapePlugin.js — Advanced shape creation utilities

export function shapePlugin(app) {
    app.shapes = {
        circle(x, y, r, color = "#fff") {
            return app.root.add({
                x, y, r, color,
                hitTest(px, py) {
                    return (px - this.x) ** 2 + (py - this.y) ** 2 <= this.r ** 2;
                },
                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
                    ctx.fill();
                },
            });
        },

        rect(x, y, w, h, color = "#fff") {
            return app.root.add({
                x, y, w, h, color,
                hitTest(px, py) {
                    return px >= this.x - this.w / 2 &&
                        px <= this.x + this.w / 2 &&
                        py >= this.y - this.h / 2 &&
                        py <= this.y + this.h / 2;
                },
                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
                },
            });
        },

        line(x1, y1, x2, y2, width = 2, color = "#fff") {
            return app.root.add({
                x1, y1, x2, y2, width, color,
                draw(ctx) {
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = this.width;
                    ctx.beginPath();
                    ctx.moveTo(this.x1, this.y1);
                    ctx.lineTo(this.x2, this.y2);
                    ctx.stroke();
                },
            });
        },

        polygon(x, y, points, color = "#fff") {
            return app.root.add({
                x, y, points, color,
                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.moveTo(points[0][0], points[0][1]);
                    for (const p of points.slice(1))
                        ctx.lineTo(p[0], p[1]);
                    ctx.closePath();
                    ctx.fill();
                },
            });
        },

        text(x, y, message, size = 24, color = "#fff") {
            return app.root.add({
                x, y, message, size, color,
                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.font = `${this.size}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(this.message, 0, 0);
                },
            });
        },
    };

    // Optional: groups
    app.shapes.group = function(...objs) {
        return {
            objs,
            addTo(layer) {
                objs.forEach(o => layer.add(o));
                return this;
            },
            setColor(c) {
                objs.forEach(o => (o.color = c));
                return this;
            }
        };
    };
}
