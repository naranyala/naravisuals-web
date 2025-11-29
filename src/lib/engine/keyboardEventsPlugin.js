// keyboardEventsPlugin.js
// Plug-and-play keyboard system with:
// • isDown / wasPressed / wasReleased
// • key aliases (space, left, up, wasd, arrows…)
// • preventDefault for game keys
// • auto-cleanup on app.stop()

export function keyboardEventsPlugin(app) {
    {
        const keys = new Map();           // code → { down: bool, pressed: bool, released: bool }
        const aliases = new Map();        // alias → Set of key codes

        // ─── Default aliases (feel free to extend) ─────────────────────
        const addAlias = (alias, ...codes) => {
            if (!aliases.has(alias)) aliases.set(alias, new Set());
            codes.forEach(code => aliases.get(alias).add(code));
        };

        addAlias('up', 'ArrowUp', 'KeyW');
        addAlias('down', 'ArrowDown', 'KeyS');
        addAlias('left', 'ArrowLeft', 'KeyA');
        addAlias('right', 'ArrowRight', 'KeyD');
        addAlias('space', 'Space');
        addAlias('shift', 'ShiftLeft', 'ShiftRight');
        addAlias('ctrl', 'ControlLeft', 'ControlRight');
        addAlias('enter', 'Enter');
        addAlias('esc', 'Escape');
        addAlias('jump', 'Space', 'ArrowUp', 'KeyW');
        addAlias('fire', 'KeyZ', 'KeyJ', 'Space');

        // ─── Core state ───────────────────────────────────────────────
        const keyboard = {
            // Raw key state
            isDown(code) { return keys.get(code)?.down === true; },
            wasPressed(code) { return keys.get(code)?.pressed === true; },
            wasReleased(code) { return keys.get(code)?.released === true; },

            // Alias state (true if ANY mapped key matches) - OPTIMIZED VERSION
            isDownAlias(alias) {
                const codes = aliases.get(alias);
                if (!codes) return false;
                for (const code of codes) {
                    if (this.isDown(code)) return true;
                }
                return false;
            },
            wasPressedAlias(alias) {
                const codes = aliases.get(alias);
                if (!codes) return false;
                for (const code of codes) {
                    if (this.wasPressed(code)) return true;
                }
                return false;
            },
            wasReleasedAlias(alias) {
                const codes = aliases.get(alias);
                if (!codes) return false;
                for (const code of codes) {
                    if (this.wasReleased(code)) return true;
                }
                return false;
            },

            // Add your own aliases at runtime
            addAlias,

            // Reset pressed/released flags (called every frame by the plugin)
            _clearTransient() {
                for (const state of keys.values()) {
                    state.pressed = false;
                    state.released = false;
                }
            }
        };

        // ─── Event listeners ───────────────────────────────────────────
        const onKeyDown = (e) => {
            const code = e.code;
            if (!keys.has(code)) {
                keys.set(code, { down: true, pressed: true, released: false });
            } else {
                const state = keys.get(code);
                if (!state.down) state.pressed = true;
                state.down = true;
            }

            // Optional: prevent scrolling with arrows/space, etc.
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
                e.preventDefault();
            }
        };

        const onKeyUp = (e) => {
            const code = e.code;
            const state = keys.get(code);
            if (state) {
                state.down = false;
                state.released = true;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // Auto-cleanup when app stops
        const originalStop = app.stop;
        app.stop = () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            originalStop?.();
        };

        // Clear "pressed/released" every frame (so they only last one frame)
        app.start(function*() {
            while (true) {
                keyboard._clearTransient();
                yield 0; // runs every frame
            }
        });

        // ─── Expose to app ─────────────────────────────────────────────
        app.keyboard = keyboard;

        // Bonus: super common shortcuts
        app.keyboard.isPressed = (key) => app.keyboard.wasPressed(key) || app.keyboard.wasPressedAlias(key);
        // Example: if (app.keyboard.isPressed('space')) player.jump();

        console.log("keyboardEventsPlugin loaded – use app.keyboard.isDown('KeyW') or app.keyboard.isPressed('jump')");
    }
}
