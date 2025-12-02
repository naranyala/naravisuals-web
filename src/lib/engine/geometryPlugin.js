// geometryPlugin.js — Minimal working geometry plugin
export function geometryPlugin(app) {

    // Simple factory functions
    const Point = (x = 0, y = 0) => ({ x, y });
    const Circle = (x = 0, y = 0, r = 0) => ({ x, y, r });
    const Line = (a = Point(), b = Point()) => ({ a, b });

    // Drawing functions - using existing canvas_util functions
    const draw = {
        circle: (circle, options = {}) => {
            const { fill, stroke, width = 2 } = options;
            return app.root.add({
                x: circle.x,
                y: circle.y,
                radius: circle.r,
                fill,
                stroke,
                lineWidth: width,
                draw(ctx) {
                    if (this.fill) {
                        ctx.fillStyle = this.fill;
                        ctx.beginPath();
                        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    if (this.stroke) {
                        ctx.strokeStyle = this.stroke;
                        ctx.lineWidth = this.lineWidth;
                        ctx.beginPath();
                        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            });
        },

        line: (line, options = {}) => {
            const { stroke = '#000', width = 2 } = options;
            return app.root.add({
                x1: line.a.x,
                y1: line.a.y,
                x2: line.b.x,
                y2: line.b.y,
                color: stroke,
                lineWidth: width,
                draw(ctx) {
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = this.lineWidth;
                    ctx.beginPath();
                    ctx.moveTo(this.x1 - this.x, this.y1 - this.y);
                    ctx.lineTo(this.x2 - this.x, this.y2 - this.y);
                    ctx.stroke();
                }
            });
        },

        point: (point, options = {}) => {
            const { size = 3, color = '#fff' } = options;
            return app.root.add({
                x: point.x,
                y: point.y,
                size,
                color,
                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    };

    // Expose to app
    app.Pt = Point;
    app.Circle = Circle;
    app.Line = Line;
    app.draw = draw;

    console.log('✓ Simple geometry plugin loaded');
    return app;
}
