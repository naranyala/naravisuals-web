// twoDimensionGridPlugin.js
// Rich 2-D grid that auto-applies when used.

export function twoDimensionGridPlugin(app, opts = {}) {
    /* ---------- default config ---------- */
    const cfg = {
        step: 40,                 // px between major lines
        color: '#ffffff',         // line colour (any valid CSS string)
        lineWidth: 1,             // stroke thickness
        alpha: 0.15,              // globalAlpha for the entire grid
        subdivisions: 0,          // extra faint lines between majors (0 = off)
        subColor: '#ffffff',      // colour for subdivision lines
        subAlpha: 0.05,           // alpha for subdivision lines
        subLineWidth: 0.5,
        axes: false,              // draw bold x/y axes through (0,0)?
        axisColor: '#ffffff',
        axisWidth: 2,
        axisAlpha: 0.8,
        ...opts
    };

    /* ---------- grid object ---------- */
    const grid = app.root.add({
        ...cfg,                   // expose all config keys on the object
        visible: true,            // can be toggled later: grid.visible = false

        draw(ctx) {
            if (!this.visible) return;

            const w = app.canvas.width,
                h = app.canvas.height;

            ctx.save();

            /* ---- subdivisions ---- */
            if (this.subdivisions > 0) {
                ctx.strokeStyle = this.subColor;
                ctx.lineWidth = this.subLineWidth;
                ctx.globalAlpha = this.subAlpha;
                const subStep = this.step / (this.subdivisions + 1);

                for (let x = subStep; x < w; x += subStep) {
                    if (Math.abs(x % this.step) > 0.1) { // skip major positions
                        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
                    }
                }
                for (let y = subStep; y < h; y += subStep) {
                    if (Math.abs(y % this.step) > 0.1) {
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
                    }
                }
            }

            /* ---- major grid ---- */
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.lineWidth;
            ctx.globalAlpha = this.alpha;

            for (let x = 0; x <= w; x += this.step) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y <= h; y += this.step) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            /* ---- optional axes ---- */
            if (this.axes) {
                ctx.strokeStyle = this.axisColor;
                ctx.lineWidth = this.axisWidth;
                ctx.globalAlpha = this.axisAlpha;
                // x-axis
                ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
                // y-axis
                ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
            }

            ctx.restore();
        }
    });

    console.log('⚪ twoDimensionGridPlugin auto-applied with config:', cfg);
}
