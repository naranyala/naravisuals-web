// dragAndDropPlugin.js — plug-and-play dragging for canvas_util.js
export const dragAndDropPlugin = (app) => {
    // keep track of who is being dragged
    let dragged = null;
    let offsetLocal = { x: 0, y: 0 }; // pointer offset in object-local space

    // helper: inverse-transform a point (world → local)
    function globalToLocal(obj, gx, gy) {
        const cos = Math.cos(-obj.rotation);
        const sin = Math.sin(-obj.rotation);
        const dx = gx - obj.x;
        const dy = gy - obj.y;
        return {
            x: (dx * cos - dy * sin) / obj.scaleX,
            y: (dx * sin + dy * cos) / obj.scaleY
        };
    }

    // helper: local → world
    function localToGlobal(obj, lx, ly) {
        const cos = Math.cos(obj.rotation);
        const sin = Math.sin(obj.rotation);
        const x = lx * obj.scaleX;
        const y = ly * obj.scaleY;
        return {
            x: obj.x + x * cos - y * sin,
            y: obj.y + x * sin + y * cos
        };
    }

    // hit-test: is pointer inside the object?
    // Works for any object that exposes w/h or uses Path2D / fillRect.
    function hitTest(obj, px, py) {
        const local = globalToLocal(obj, px, py);
        // 1. rect test (most common)
        if ('w' in obj && 'h' in obj) {
            return Math.abs(local.x) <= obj.w / 2 && Math.abs(local.y) <= obj.h / 2;
        }
        // 2. circle test
        if ('r' in obj) {
            return local.x * local.x + local.y * local.y <= obj.r * obj.r;
        }
        // 3. let object supply its own hit test
        if (obj.hitTest) return obj.hitTest(local.x, local.y);
        // 4. fallback: always hit
        return true;
    }

    // clamp helper
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    // pointer events already live on app.pointer
    function onDown() {
        if (dragged) return; // one at a time
        // search from top layer down, last object first (painter order)
        for (let i = app.layers.length - 1; i >= 0; i--) {
            const objs = app.layers[i].objects;
            for (let j = objs.length - 1; j >= 0; j--) {
                const o = objs[j];
                if (!o._draggable) continue;
                if (hitTest(o, app.pointer.x, app.pointer.y)) {
                    dragged = o;
                    const local = globalToLocal(o, app.pointer.x, app.pointer.y);
                    offsetLocal.x = local.x;
                    offsetLocal.y = local.y;

                    if (o._dragOpts.onStart) {
                        const ok = o._dragOpts.onStart(o, app.pointer);
                        if (ok === false) { dragged = null; return; }
                    }
                    break;
                }
            }
            if (dragged) break;
        }
    }

    function onMove() {
        if (!dragged) return;
        const opts = dragged._dragOpts;

        // compute where the *center* should be so that the grabbed spot stays under pointer
        const wanted = localToGlobal(dragged, offsetLocal.x, offsetLocal.y);
        let newX = dragged.x + (app.pointer.x - wanted.x);
        let newY = dragged.y + (app.pointer.y - wanted.y);

        // axis lock
        if (opts.axis === 'x') newY = dragged.y;
        if (opts.axis === 'y') newX = dragged.x;

        // bounds
        if (opts.bounds) {
            const b = opts.bounds;
            newX = clamp(newX, b.minX, b.maxX);
            newY = clamp(newY, b.minY, b.maxY);
        }

        dragged.x = newX;
        dragged.y = newY;

        if (opts.onDrag) opts.onDrag(dragged, app.pointer);
    }

    function onUp() {
        if (!dragged) return;
        if (dragged._dragOpts.onEnd) dragged._dragOpts.onEnd(dragged, app.pointer);
        dragged = null;
    }

    // register once
    app.canvas.addEventListener('pointerdown', onDown);
    app.canvas.addEventListener('pointermove', onMove);
    app.canvas.addEventListener('pointerup', onUp);

    // extend every object added from now on
    const oldAdd = app.root.add.bind(app.root);
    function augmentAdd(layer) {
        const original = layer.add.bind(layer);
        layer.add = function(obj) {
            obj.makeDraggable = function(opts = {}) {
                this._draggable = true;
                this._dragOpts = {
                    onStart: opts.onStart || null,
                    onDrag: opts.onDrag || null,
                    onEnd: opts.onEnd || null,
                    bounds: opts.bounds || null,
                    axis: opts.axis || null
                };
                return this;
            };
            return original(obj);
        };
    }
    // patch all existing layers
    app.layers.forEach(augmentAdd);
    // and future ones
    const oldCreate = app.createLayer;
    app.createLayer = function(...args) {
        const layer = oldCreate(...args);
        augmentAdd(layer);
        return layer;
    };
};
