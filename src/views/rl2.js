
// rl.js — minimal raylib-inspired framework

export const RL = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    _keys: new Set(),
    _mouse: { x: 0, y: 0, pressed: false },
    _lastTime: 0,
    _updateFn: null,

    InitWindow(width, height, title = "MiniRaylibJS") {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        document.title = title;
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");
        this.width = width;
        this.height = height;

        window.addEventListener("keydown", e => this._keys.add(e.code));
        window.addEventListener("keyup", e => this._keys.delete(e.code));
        window.addEventListener("mousemove", e => {
            const r = this.canvas.getBoundingClientRect();
            this._mouse.x = e.clientX - r.left;
            this._mouse.y = e.clientY - r.top;
        });
        window.addEventListener("mousedown", () => this._mouse.pressed = true);
        window.addEventListener("mouseup", () => this._mouse.pressed = false);
    },

    BeginDrawing() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },

    EndDrawing() { /* reserved for future batching */ },

    SetTargetFPS(fps) {
        this.targetDelta = 1000 / fps;
    },

    IsKeyDown(code) {
        return this._keys.has(code);
    },

    GetMousePosition() {
        return { ...this._mouse };
    },

    DrawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    },

    DrawLine(x1, y1, x2, y2, color, width = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    },

    DrawRectangle(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    },

    DrawRectangleLines(x, y, w, h, color, width = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.strokeRect(x, y, w, h);
    },

    DrawCircle(x, y, r, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
    },

    DrawText(text, x, y, fontSize, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.fillText(text, x, y);
    },

    LoadTexture(path) {
        const img = new Image();
        img.src = path;
        return img;
    },

    DrawTexture(tex, x, y, w = tex.width, h = tex.height) {
        this.ctx.drawImage(tex, x, y, w, h);
    },

    Run(updateFn) {
        this._updateFn = updateFn;
        this._lastTime = performance.now();
        const loop = (t) => {
            const dt = t - this._lastTime;
            if (dt >= this.targetDelta) {
                this._lastTime = t;
                updateFn(dt / 1000);
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
};
