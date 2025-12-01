// collisionPlugin.js — tiny but mighty 2-D collision kit
// v2.0  (c) 2025 – MIT licence
// Adds: triggers, layers, exit callbacks, broad-phase grid, debug draw, perf stats

export function collisionPlugin(app, opts = {}) {
    /* ---------- config ---------- */
    const {
        cellSize = 200,      // spatial-grid cell (0 = disable grid)
        debug = false,    // show colliders every frame
        maxObjectsPerCell = 64,       // grid safety valve
    } = opts;

    /* ---------- internal state ---------- */
    const pairs = new Map();   // "tagA:tagB" → { enter:Set, exit:Set, stay:Set }
    const tracked = new Map();   // obj → { colliders:Set, cells:Set, layer:Number }
    const grid = cellSize > 0 ? new Grid(cellSize) : null;
    let dbgStats = { tests: 0, pairs: 0, stamp: 0 };

    /* ---------- helpers ---------- */
    const isCircle = o => typeof o.r === 'number';
    const key = (ta, tb) => ta < tb ? `${ta}:${tb}` : `${tb}:${ta}`;
    const layermask = (a, b) => (a.layerMask & b.layer) && (b.layerMask & a.layer);

    /* ---------- broad-phase spatial grid ---------- */
    function Grid(cell) {
        const store = new Map();   // hash → Array
        const hash = (x, y) => `${x >> 0}_${y >> 0}`;
        this.clear = () => store.clear();
        this.insert = (o, x, y) => {
            const h = hash(~~(x / cell), ~~(y / cell));
            let arr = store.get(h);
            if (!arr) store.set(h, arr = []);
            if (arr.length < maxObjectsPerCell) arr.push(o);
        };
        this.query = (x, y) => store.get(hash(~~(x / cell), ~~(y / cell))) || [];
    }

    /* ---------- narrow-phase ---------- */
    const tests = {
        'circle-circle'(a, b) {
            const dx = a.x - b.x, dy = a.y - b.y, rr = a.r + b.r;
            return dx * dx + dy * dy <= rr * rr;
        },
        'aabb-aabb'(a, b) {
            return a.x - a.hw < b.x + b.hw && a.x + a.hw > b.x - b.hw &&
                a.y - a.hh < b.y + b.hh && a.y + a.hh > b.y - b.hh;
        },
        'circle-aabb'(c, r) {
            const closestX = Math.max(r.x - r.hw, Math.min(c.x, r.x + r.hw));
            const closestY = Math.max(r.y - r.hh, Math.min(c.y, r.y + r.hh));
            const dx = c.x - closestX, dy = c.y - closestY;
            return dx * dx + dy * dy <= c.r * c.r;
        }
    };

    function getShape(o) {
        if (isCircle(o)) return { type: 'circle', x: o.x, y: o.y, r: o.r };
        const hw = (o.w || 0) / 2, hh = (o.h || 0) / 2;
        return { type: 'aabb', x: o.x, y: o.y, hw, hh };
    }

    function collide(a, b) {
        dbgStats.tests++;
        const sa = getShape(a), sb = getShape(b);
        if (sa.type === 'circle' && sb.type === 'circle') return tests['circle-circle'](sa, sb);
        if (sa.type === 'aabb' && sb.type === 'aabb') return tests['aabb-aabb'](sa, sb);
        if (sa.type === 'circle' && sb.type === 'aabb') return tests['circle-aabb'](sa, sb);
        return tests['circle-aabb'](sb, sa); // reversed
    }

    /* ---------- pair registry ---------- */
    function ensurePair(tagA, tagB) {
        const k = key(tagA, tagB);
        let p = pairs.get(k);
        if (!p) pairs.set(k, p = { enter: new Set(), exit: new Set(), stay: new Set() });
        return p;
    }

    /* ---------- public API ---------- */
    app.collision = {
        track(obj, opts = {}) {
            if (!obj.collisionTag) return;
            const data = {
                layer: opts.layer ?? 0,
                layerMask: opts.layerMask ?? ~0, // all layers by default
                isTrigger: opts.isTrigger ?? false,
                colliders: new Set(),
                cells: new Set()
            };
            tracked.set(obj, data);
        },

        untrack(obj) {
            const data = tracked.get(obj);
            if (!data) return;
            // fire exit for every overlap
            for (const other of data.colliders) {
                const p = ensurePair(obj.collisionTag, other.collisionTag);
                p.exit.forEach(fn => fn(obj, other));
                const rev = tracked.get(other);
                if (rev) rev.colliders.delete(obj);
            }
            tracked.delete(obj);
        },

        on(tagA, tagB, stage, cb) { // stage = 'enter'|'stay'|'exit'
            if (typeof stage === 'function') { // backward compat: shift args
                cb = stage; stage = 'enter';
            }
            ensurePair(tagA, tagB)[stage].add(cb);
        },

        off(tagA, tagB, stage, cb) {
            const p = pairs.get(key(tagA, tagB));
            if (p) p[stage].delete(cb);
        },

        /* ---------- utilities ---------- */
        overlaps(a, b) {
            return tracked.get(a)?.colliders.has(b) ?? false;
        },

        debugDraw(ctx) {
            if (!debug) return;
            ctx.save();
            ctx.strokeStyle = '#0f0'; ctx.lineWidth = 1;
            for (const [obj] of tracked) {
                const s = getShape(obj);
                ctx.beginPath();
                if (s.type === 'circle') ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                else ctx.rect(s.x - s.hw, s.y - s.hh, s.hw * 2, s.hh * 2);
                ctx.stroke();
            }
            ctx.restore();
        },

        stats() { return { ...dbgStats }; }
    };

    /* ---------- hook into engine ---------- */
    const origAdd = app.root.add;
    app.root.add = function(obj) {
        origAdd.call(this, obj);
        if (obj.collisionTag) app.collision.track(obj);
        return obj;
    };

    /* ---------- main loop ---------- */
    app.start(function* collisionLoop() {
        while (true) {
            dbgStats = { tests: 0, pairs: 0, stamp: performance.now() };
            const arr = [...tracked.keys()];
            if (grid) grid.clear();

            /* ---------- update spatial grid ---------- */
            for (const a of arr) {
                const data = tracked.get(a);
                const s = getShape(a);
                if (grid) grid.insert(a, s.x, s.y);
            }

            /* ---------- narrow-phase ---------- */
            for (const a of arr) {
                const dataA = tracked.get(a);
                const candidates = grid ? grid.query(getShape(a).x, getShape(a).y) : arr;
                if (!last.has(a)) last.set(a, new Map()); // object -> other → state
                const stateMap = last.get(a);

                for (const b of candidates) {
                    if (a === b) continue;
                    const dataB = tracked.get(b);
                    if (!layermask(dataA, dataB)) continue;

                    const colliding = collide(a, b);
                    const prevState = stateMap.get(b) || 'none';
                    const pair = ensurePair(a.collisionTag, b.collisionTag);

                    if (colliding && prevState === 'none') {         // enter
                        if (!dataA.isTrigger && !dataB.isTrigger) {
                            dataA.colliders.add(b); dataB.colliders.add(a);
                        }
                        stateMap.set(b, 'inside');
                        pair.enter.forEach(fn => fn(a, b));
                    } else if (colliding && prevState === 'inside') { // stay
                        pair.stay.forEach(fn => fn(a, b));
                    } else if (!colliding && prevState === 'inside') { // exit
                        dataA.colliders.delete(b); dataB.colliders.delete(a);
                        stateMap.set(b, 'none');
                        pair.exit.forEach(fn => fn(a, b));
                    }
                }
            }

            yield;
        }
    });

    /* ---------- debug overlay ---------- */
    if (debug) {
        const origDraw = app.loop.draw;
        app.loop.draw = function(ctx) {
            origDraw.call(this, ctx);
            app.collision.debugDraw(ctx);
        };
    }
}
