// collisionPlugin.js — micro AABB & circle collisions
export function collisionPlugin(app) {
    const pairs = new Map();          // "tagA:tagB" -> Set of callbacks
    const tracked = new Set();        // every object that has a collisionTag

    /* ---------- helpers ---------- */
    const isCircle = o => typeof o.r === 'number';
    const getAABB = o => {
        if (isCircle(o)) {
            return { l: o.x - o.r, t: o.y - o.r, r: o.x + o.r, b: o.y + o.r };
        }
        const hw = (o.w || 0) / 2, hh = (o.h || 0) / 2;
        return { l: o.x - hw, t: o.y - hh, r: o.x + hw, b: o.y + hh };
    };
    const test = (a, b) => {
        if (isCircle(a) && isCircle(b)) {
            const dx = a.x - b.x, dy = a.y - b.y, rr = a.r + b.r;
            return dx * dx + dy * dy <= rr * rr;
        }
        // mixed or rect-rect  -> AABB
        const A = getAABB(a), B = getAABB(b);
        return A.l < B.r && A.r > B.l && A.t < B.b && A.b > B.t;
    };
    const key = (ta, tb) => ta < tb ? `${ta}:${tb}` : `${tb}:${ta}`;

    /* ---------- public API ---------- */
    app.collision = {
        track(obj) {
            if (!obj.collisionTag) return;
            tracked.add(obj);
        },
        untrack(obj) {
            tracked.delete(obj);
        },
        on(tagA, tagB, cb) {
            const k = key(tagA, tagB);
            if (!pairs.has(k)) pairs.set(k, new Set());
            pairs.get(k).add(cb);
        },
        off(tagA, tagB, cb) {
            const k = key(tagA, tagB);
            const set = pairs.get(k);
            if (set) set.delete(cb);
        },
    };

    /* ---------- hook into engine ---------- */
    const origAdd = app.root.add;
    app.root.add = function(obj) {
        origAdd.call(this, obj);
        if (obj.collisionTag) app.collision.track(obj);
        return obj;
    };

    /* ---------- broad-phase every frame ---------- */
    const last = new Map();           // obj -> Set of current overlaps
    app.start(function* collisionLoop() {
        while (true) {
            const arr = [...tracked];
            /*----- narrow-phase -----*/
            for (let i = 0; i < arr.length; i++) {
                const a = arr[i];
                if (!last.has(a)) last.set(a, new Set());
                const setA = last.get(a);

                for (let j = i + 1; j < arr.length; j++) {
                    const b = arr[j];
                    const k = key(a.collisionTag, b.collisionTag);
                    const callbacks = pairs.get(k);
                    if (!callbacks || callbacks.size === 0) continue;

                    const colliding = test(a, b);
                    const pairId = b;               // object identity as key
                    const was = setA.has(pairId);

                    if (colliding && !was) {        // enter
                        setA.add(pairId);
                        callbacks.forEach(fn => fn(a, b));
                    } else if (!colliding && was) { // exit
                        setA.delete(pairId);
                    }
                }
            }
            yield; // wait one frame (coroutine scheduler accepts truthy non-number)
        }
    });
}
