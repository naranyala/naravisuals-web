// == reactive.js ==
// Tiny reactive signals system (~2KB) – Solid.js style, zero dependencies
// Paste in console, bookmarklet, or userscript. Instantly reactive.

const Reactive = (() => {
    const allSignals = new Set();
    const scheduled = new Set();

    class Signal {
        constructor(value, options = {}) {
            this._value = value;
            this.deps = new Set();        // signals that depend on me
            this.sources = new Set();     // signals I depend on (for computed)
            this.compute = options.compute || null;
            this.equals = options.equals ?? Object.is;
            allSignals.add(this);

            if (this.compute) {
                this._run();
            }
        }

        _run() {
            const prev = Reactive.current;
            Reactive.current = this;
            this.sources.clear();
            const newValue = this.compute();
            Reactive.current = prev;

            if (!this.equals(this._value, newValue)) {
                this._value = newValue;
                this._notify();
            }
        }

        _notify() {
            for (const dep of this.deps) {
                scheduled.add(dep);
            }
            if (scheduled.size && !Reactive.running) {
                Reactive.running = true;
                queueMicrotask(() => {
                    for (const s of scheduled) s._run();
                    scheduled.clear();
                    Reactive.running = false;
                });
            }
        }

        get value() {
            if (Reactive.current) {
                this.deps.add(Reactive.current);
                Reactive.current.sources.add(this);
            }
            return this._value;
        }

        set value(v) {
            if (this.compute) throw new Error("Cannot set computed signal");
            if (!this.equals(this._value, v)) {
                this._value = v;
                this._notify();
            }
        }

        peek() { return this._value; }
        touch() { this._notify(); }
    }

    Reactive.current = null;
    Reactive.running = false;

    function createSignal(initialValue, options) {
        return new Signal(initialValue, options);
    }

    function createComputed(computeFn) {
        return new Signal(undefined, { compute: computeFn });
    }

    function createEffect(fn) {
        const effect = createComputed(() => {
            fn();
            return undefined;
        });
        effect._run(); // run once immediately
        return () => allSignals.delete(effect);
    }

    // === Quick API shortcuts ===
    const signal = (v, eq) => createSignal(v, eq ? { equals: eq } : {});
    const computed = (fn) => createComputed(fn);
    const effect = (fn) => createEffect(fn);

    // Cleanup everything
    const reset = () => {
        allSignals.clear();
        scheduled.clear();
    };

    return { signal, computed, effect, reset, Signal };
})();

export default Reactive

// // === Example usage right in console ===
// console.log("%c🚀 reactive.js loaded!", "color:#0f9; font-weight:bold");
//
// const [count, setCount] = [Reactive.signal(0), (v) => count.value = v];
// const doubled = Reactive.computed(() => count.value * 2);
// const label  = Reactive.computed(() => `Count is ${count.value} (2x=${doubled.value})`);
//
// Reactive.effect(() => console.log("Live →", label.value));
//
// setCount(1);   // → Live → Count is 1 (2x=2)
// setCount(5);   // → Live → Count is 5 (2x=10)
// setCount(5);   // (no log – equality check works)
//
// // Try it yourself:
// setCount(42);
//
// // Want DOM reactivity? One-liner:
// const $output = document.createElement('div');
// $output.style = 'position:fixed; bottom:10px; right:10px; background:#000; color:#0f9; padding:10px; font:16px monospace; z-index:99999; border:2px solid #0f9; border-radius:8px;';
// document.body.appendChild($output);
//
// Reactive.effect(() => $output.textContent = `🔥 Reactive Debug → ${label.value}`);
