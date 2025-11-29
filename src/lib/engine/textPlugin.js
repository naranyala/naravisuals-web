// textPlugin.js — Advanced text creation utilities with styling & alignment

export const textPlugin = (app) => {
    app.text = {
        /**
         * Create a basic centered text object
         */
        basic(x, y, message, {
            size = 24,
            color = "#fff",
            font = "sans-serif",
            align = "center",        // left | center | right
            baseline = "middle",     // top | middle | bottom | alphabetic
            opacity = 1,
            rotation = 0,
            scaleX = 1,
            scaleY = 1
        } = {}) {
            return app.root.add({
                x, y, message, size, color, font, align, baseline,
                opacity, rotation, scaleX, scaleY,

                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.font = `${this.size}px ${this.font}`;
                    ctx.textAlign = this.align;
                    ctx.textBaseline = this.baseline;
                    ctx.fillText(this.message, 0, 0);
                }
            });
        },

        /**
         * Stroked (outlined) text
         */
        stroke(x, y, message, {
            size = 24,
            color = "#fff",
            strokeColor = "#000",
            strokeWidth = 4,
            font = "sans-serif",
            align = "center",
            baseline = "middle"
        } = {}) {
            return app.root.add({
                x, y, message, size, color, strokeColor, strokeWidth, font, align, baseline,

                draw(ctx) {
                    ctx.font = `${this.size}px ${this.font}`;
                    ctx.textAlign = this.align;
                    ctx.textBaseline = this.baseline;

                    if (this.strokeWidth > 0) {
                        ctx.lineWidth = this.strokeWidth;
                        ctx.strokeStyle = this.strokeColor;
                        ctx.strokeText(this.message, 0, 0);
                    }

                    ctx.fillStyle = this.color;
                    ctx.fillText(this.message, 0, 0);
                }
            });
        },

        /**
         * Gradient text (linear gradient)
         */
        gradient(x, y, message, {
            size = 48,
            gradient = ["#ff0080", "#00ffff"], // array of colors
            direction = "to bottom", // "to right", "to bottom right", etc.
            font = "sans-serif",
            align = "center",
            baseline = "middle"
        } = {}) {
            const gradColors = Array.isArray(gradient) ? gradient : [gradient, "#fff"];

            return app.root.add({
                x, y, message, size, gradColors, direction, font, align, baseline,

                draw(ctx) {
                    ctx.font = `${this.size}px ${this.font}`;
                    ctx.textAlign = this.align;
                    ctx.textBaseline = this.baseline;

                    let grad;
                    if (this.direction.includes("right")) {
                        grad = ctx.createLinearGradient(-200, 0, 200, 0);
                    } else if (this.direction.includes("bottom")) {
                        grad = ctx.createLinearGradient(0, -50, 0, 50);
                    } else {
                        grad = ctx.createLinearGradient(0, 0, 0, this.size * 1.5);
                    }

                    this.gradColors.forEach((col, i) => {
                        grad.addColorStop(i / (this.gradColors.length - 1), col);
                    });

                    ctx.fillStyle = grad;
                    ctx.fillText(this.message, 0, 0);
                }
            });
        },

        /**
         * Animated typewriter effect
         */
        typewriter(x, y, fullText, {
            size = 32,
            color = "#fff",
            font = "sans-serif",
            speed = 50, // ms per character
            cursor = "_",
            cursorBlink = 500,
            align = "left",
            baseline = "top"
        } = {}) {
            const textObj = app.root.add({
                x, y,
                fullText,
                displayed: "",
                size, color, font, align, baseline,
                cursor,
                showCursor: true,

                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.font = `${this.size}px ${this.font}`;
                    ctx.textAlign = this.align;
                    ctx.textBaseline = this.baseline;

                    const displayedText = this.showCursor
                        ? this.displayed + this.cursor
                        : this.displayed;

                    ctx.fillText(displayedText, 0, 0);
                }
            });

            // Start the typewriter coroutine
            app.start(function*() {
                textObj.displayed = "";
                for (const char of fullText) {
                    textObj.displayed += char;
                    yield speed;
                }

                // Blink cursor at the end
                while (true) {
                    yield cursorBlink;
                    textObj.showCursor = !textObj.showCursor;
                }
            }, "typewriter");

            return textObj;
        },

        /**
         * Multi-line text with auto-wrapping
         */
        multiline(x, y, text, {
            size = 24,
            color = "#fff",
            font = "sans-serif",
            lineHeight = 1.2,
            maxWidth = 300,
            align = "left" // left | center | right
        } = {}) {
            const lines = [];
            const words = text.split(" ");
            let currentLine = "";

            const measureCtx = app.ctx;
            measureCtx.font = `${size}px ${font}`;

            for (const word of words) {
                const testLine = currentLine ? currentLine + " " + word : word;
                const metrics = measureCtx.measureText(testLine);
                if (metrics.width > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);

            return app.root.add({
                x, y, lines, size, color, font, lineHeight, align,

                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.font = `${this.size}px ${this.font}`;
                    ctx.textAlign = this.align;
                    ctx.textBaseline = "top";

                    const lineH = this.size * this.lineHeight;
                    const totalH = lineH * this.lines.length;
                    let offsetY = this.align === "center" ? -totalH / 2 :
                        this.align === "right" ? -totalH : 0;

                    this.lines.forEach(line => {
                        ctx.fillText(line, 0, offsetY);
                        offsetY += lineH;
                    });
                }
            });
        }
    };

    // Optional: group helper (mirroring shapePlugin style)
    app.text.group = function(...texts) {
        return {
            texts,
            addTo(layer = app.root) {
                texts.forEach(t => layer.add(t));
                return this;
            },
            setColor(c) {
                texts.forEach(t => { if ("color" in t) t.color = c; });
                return this;
            },
            fadeOut(duration = 1000) {
                texts.forEach(t => app.animateTo(t, "opacity", 0, duration));
                return this;
            },
            fadeIn(duration = 1000) {
                texts.forEach(t => {
                    t.opacity = 0;
                    app.animateTo(t, "opacity", 1, duration);
                });
                return this;
            }
        };
    };
};
