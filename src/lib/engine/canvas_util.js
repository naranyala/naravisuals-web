
// canvas_util.js — Enhanced single-file canvas engine

export function createCanvasApp(canvas) {
    const ctx = canvas.getContext("2d");

    let running = true;
    let last = performance.now();

    const layers = [];      // sorted by z-index
    const coroutines = [];
    const plugins = [];

    // ==========================================
    // Helpers
    // ==========================================
    const lerp = (a, b, t) => a + (b - a) * t;

    function ease(t) {
        // smoothstep
        return t * t * (3 - 2 * t);
    }

    // ==========================================
    // Coroutine Scheduler
    // ==========================================
    function startCoroutine(genFn, name = null) {
        const iterator =
            typeof genFn === "function" ? genFn() : genFn;

        coroutines.push({
            name,
            iterator,
            wait: 0,
        });
    }

    function stopCoroutine(name) {
        for (let i = coroutines.length - 1; i >= 0; i--) {
            if (coroutines[i].name === name) {
                coroutines.splice(i, 1);
            }
        }
    }

    function updateCoroutines(dt) {
        for (let c of [...coroutines]) {
            if (c.wait > 0) {
                c.wait -= dt;
                continue;
            }

            const state = c.iterator.next();
            if (state.done) {
                coroutines.splice(coroutines.indexOf(c), 1);
                continue;
            }

            if (typeof state.value === "number") {
                c.wait = state.value; // ms
            }
        }
    }

    // ==========================================
    // Transform Mixin
    // ==========================================
    function makeTransform(obj) {
        obj.x = obj.x ?? 0;
        obj.y = obj.y ?? 0;
        obj.rotation = obj.rotation ?? 0;
        obj.scaleX = obj.scaleX ?? 1;
        obj.scaleY = obj.scaleY ?? 1;
        obj.opacity = obj.opacity ?? 1;

        obj.applyTransform = function(ctx) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scaleX, this.scaleY);
        };

        return obj;
    }

    // ==========================================
    // Layers
    // ==========================================
    function createLayer(z = 0) {
        const layer = {
            zIndex: z,
            objects: [],
            add(o) {
                makeTransform(o);
                this.objects.push(o);
                return o;
            },
            remove(o) {
                const i = this.objects.indexOf(o);
                if (i !== -1) this.objects.splice(i, 1);
            },
        };
        layers.push(layer);
        layers.sort((a, b) => a.zIndex - b.zIndex);
        return layer;
    }

    // default root layer
    const root = createLayer(0);

    // ==========================================
    // Events (pointer)
    // ==========================================
    const pointer = { x: 0, y: 0, down: false };
    canvas.addEventListener("pointermove", (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
    });
    canvas.addEventListener("pointerdown", () => (pointer.down = true));
    canvas.addEventListener("pointerup", () => (pointer.down = false));

    // ==========================================
    // Animation Helpers
    // ==========================================
    function animateTo(obj, prop, target, duration = 500, easeFn = ease) {
        startCoroutine(function*() {
            const start = obj[prop];
            const t0 = performance.now();
            while (true) {
                const t = (performance.now() - t0) / duration;
                if (t >= 1) break;
                obj[prop] = lerp(start, target, easeFn(t));
                yield 16;
            }
            obj[prop] = target;
        });
    }

    // ==========================================
    // Plugin API
    // ==========================================
    function use(plugin) {
        plugins.push(plugin);
        plugin(app);
    }

    // ==========================================
    // Main Loop
    // ==========================================
    function loop(t) {
        if (!running) return;

        const dt = t - last;
        last = t;

        updateCoroutines(dt);

        // update
        for (const layer of layers)
            for (const o of layer.objects)
                o.update?.(dt);

        // draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const layer of layers) {
            for (const o of layer.objects) {
                ctx.save();
                ctx.globalAlpha = o.opacity ?? 1;

                if (o.applyTransform) {
                    ctx.save();
                    ctx.translate(o.x, o.y);
                    ctx.rotate(o.rotation);
                    ctx.scale(o.scaleX, o.scaleY);
                    o.draw?.(ctx);
                    ctx.restore();
                } else {
                    o.draw?.(ctx);
                }

                ctx.restore();
            }
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    // ==========================================
    // Stop app
    // ==========================================
    function stop() {
        running = false;
    }

    // ==========================================
    // Public API
    // ==========================================
    const app = {
        canvas,
        ctx,
        root,
        createLayer,
        start: startCoroutine,
        stop,
        use,
        layers,
        pointer,
        animateTo,
        ease,
        lerp,
        stopCoroutine,
    };

    return app;
}
