// canvasDevtoolsPlugin.js — Floating devtools overlay with live stats & inspector

export function canvasDevtoolsPlugin(app) {
    const devLayer = app.createLayer(999); // Always on top
    let visible = true;
    let collapsed = false;

    // Config
    const config = {
        bg: "rgba(20, 20, 40, 0.95)",
        border: "1px solid rgba(100, 200, 255, 0.4)",
        text: "#a0f0ff",
        accent: "#00d4ff",
        fpsColor: (fps) => fps >= 55 ? "#4ade80" : fps >= 30 ? "#fbbf24" : "#ef4444",
        font: "13px 'Fira Code', 'JetBrains Mono', monospace",
    };

    // Root container
    const panel = devLayer.add({
        x: 20,
        y: 20,
        width: 360,
        height: collapsed ? 60 : 380,
        opacity: 0.98,
        draw(ctx) {
            ctx.fillStyle = config.bg;
            ctx.strokeStyle = config.accent;
            ctx.lineWidth = 2;
            ctx.roundRect(0, 0, this.width, this.height, 16);
            ctx.fill();
            ctx.stroke();

            // Title bar
            ctx.fillStyle = collapsed ? "rgba(0, 212, 255, 0.2)" : "rgba(0, 212, 255, 0.15)";
            ctx.roundRect(0, 0, this.width, 44, 16);
            ctx.fill();

            ctx.fillStyle = config.accent;
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText("Canvas DevTools", 18, 22);

            // Toggle button
            ctx.fillStyle = config.text;
            ctx.font = "20px sans-serif";
            ctx.fillText(collapsed ? ">" : "v", this.width - 36, 22);
        }
    });

    // FPS counter
    let fps = 0, frames = 0, lastFpsTime = performance.now();
    const fpsText = app.text.basic(18, 68, "FPS: --", {
        size: 15,
        color: "#4ade80",
        font: "bold monospace"
    });
    devLayer.add(fpsText);

    // Object count
    const objCount = app.text.basic(18, 98, "Objects: --", { size: 14, color: config.text });
    devLayer.add(objCount);

    // Pointer info
    const pointerInfo = app.text.basic(18, 128, "Pointer: --", { size: 14, color: config.text });
    devLayer.add(pointerInfo);

    // Coroutines
    const coroCount = app.text.basic(18, 158, "Coroutines: --", { size: 14, color: config.text });
    devLayer.add(coroCount);

    // Plugins list
    const pluginsTitle = app.text.basic(18, 198, "Plugins:", { size: 14, color: config.accent });
    devLayer.add(pluginsTitle);

    const pluginTexts = [];

    // Hit test for toggle
    panel.hitTest = (px, py) => {
        const rect = panel.getBoundingClientRect?.() || {
            left: panel.x,
            top: panel.y,
            right: panel.x + panel.width,
            bottom: panel.y + (collapsed ? 60 : panel.height)
        };
        return px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom + 40;
    };

    app.canvas.addEventListener("pointerdown", (e) => {
        if (!visible) return;
        const rect = app.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (panel.hitTest(x, y)) {
            collapsed = !collapsed;
            panel.height = collapsed ? 60 : 380;
            e.stopPropagation();
        }
    });

    // Update loop
    app.start(function*() {
        while (true) {
            // FPS
            frames++;
            const now = performance.now();
            if (now - lastFpsTime >= 1000) {
                fps = Math.round((frames * 1000) / (now - lastFpsTime));
                lastFpsTime = now;
                frames = 0;
                fpsText.color = config.fpsColor(fps);
            }
            fpsText.message = `FPS: ${fps}`;

            // Stats
            let totalObjects = 0;
            app.layers.forEach(l => totalObjects += l.objects.length);
            objCount.message = `Objects: ${totalObjects}`;
            pointerInfo.message = `Pointer: ${Math.round(app.pointer.x)}, ${Math.round(app.pointer.y)} ${app.pointer.down ? " [DOWN]" : ""}`;
            coroCount.message = `Coroutines: ${app.coroutines?.length || coroutines.length}`;

            // Plugins
            const loaded = Object.keys(app).filter(k =>
                typeof app[k] === "object" && k !== "root" && k !== "canvas" && k !== "ctx"
            );
            pluginsTitle.message = `Plugins (${loaded.length}):`;

            // Remove old plugin texts
            pluginTexts.forEach(t => devLayer.remove(t));
            pluginTexts.length = 0;

            if (!collapsed) {
                loaded.slice(0, 10).forEach((name, i) => {
                    const txt = app.text.basic(34, 228 + i * 26, `• ${name}`, {
                        size: 13,
                        color: i === 0 ? "#ffdd00" : "#bbbbff"
                    });
                    devLayer.add(txt);
                    pluginTexts.push(txt);
                });
            }

            yield 100; // Update every 100ms
        }
    });

    // Public API
    app.devtools = {
        show() { visible = true; },
        hide() { visible = false; },
        toggle() { visible = !visible; },
        collapse() { collapsed = true; panel.height = 60; },
        expand() { collapsed = false; panel.height = 380; },
        panel,
    };

    // Hotkey: Press ` ~ ` (backtick) to toggle
    window.addEventListener("keydown", (e) => {
        if (e.key === "`" || e.key === "~") {
            e.preventDefault();
            app.devtools.toggle();
        }
    });

    // Auto-hide when not in dev
    if (!location.hostname.includes("localhost") && !location.port) {
        visible = false;
    }
}
