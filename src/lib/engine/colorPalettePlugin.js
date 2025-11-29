// colorPalettePlugin.js — Color palette and gradient utilities

export function colorPalettePlugin(app) {
    // Predefined color palettes
    const palettes = {
        vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
        pastel: ['#FFD1DC', '#C4E0F9', '#B5EAD7', '#FFC8A2', '#E2F0CB'],
        monochrome: ['#2C2C2C', '#5A5A5A', '#888888', '#B6B6B6', '#E4E4E4'],
        nature: ['#556B2F', '#8FBC8F', '#66CDAA', '#20B2AA', '#008080'],
        sunset: ['#FF7E5F', '#FEB47B', '#FF6A95', '#A7226E', '#6A0572']
    };

    // Gradient types
    const gradientTypes = {
        LINEAR: 'linear',
        RADIAL: 'radial'
    };

    app.colors = {
        // Color conversion utilities
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },

        // Color manipulation
        lighten(hex, percent) {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return hex;

            const factor = 1 + (percent / 100);
            return this.rgbToHex(
                Math.min(255, Math.floor(rgb.r * factor)),
                Math.min(255, Math.floor(rgb.g * factor)),
                Math.min(255, Math.floor(rgb.b * factor))
            );
        },

        darken(hex, percent) {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return hex;

            const factor = 1 - (percent / 100);
            return this.rgbToHex(
                Math.max(0, Math.floor(rgb.r * factor)),
                Math.max(0, Math.floor(rgb.g * factor)),
                Math.max(0, Math.floor(rgb.b * factor))
            );
        },

        // Gradient creation
        createGradient(type, colors, rotation = 0) {
            return {
                type,
                colors,
                rotation,
                apply(ctx, x, y, width, height) {
                    let gradient;

                    if (type === gradientTypes.LINEAR) {
                        const angle = (rotation * Math.PI) / 180;
                        const cos = Math.cos(angle);
                        const sin = Math.sin(angle);

                        const x1 = x + width / 2 * (1 - cos);
                        const y1 = y + height / 2 * (1 - sin);
                        const x2 = x + width / 2 * (1 + cos);
                        const y2 = y + height / 2 * (1 + sin);

                        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                    } else {
                        gradient = ctx.createRadialGradient(
                            x + width / 2, y + height / 2, 0,
                            x + width / 2, y + height / 2, Math.max(width, height) / 2
                        );
                    }

                    const step = 1 / (colors.length - 1);
                    colors.forEach((color, index) => {
                        gradient.addColorStop(index * step, color);
                    });

                    return gradient;
                }
            };
        },

        // Palette management
        getPalette(name) {
            return palettes[name] ? [...palettes[name]] : null;
        },

        addPalette(name, colors) {
            palettes[name] = [...colors];
        },

        getRandomFromPalette(paletteName) {
            const palette = palettes[paletteName];
            if (!palette) return '#FFFFFF';
            return palette[Math.floor(Math.random() * palette.length)];
        },

        // Color cycling animation
        createColorCycler(colors, duration = 2000) {
            return {
                colors,
                duration,
                currentTime: 0,

                update(dt) {
                    this.currentTime = (this.currentTime + dt) % this.duration;
                },

                getCurrentColor() {
                    const progress = this.currentTime / this.duration;
                    const index = Math.floor(progress * this.colors.length) % this.colors.length;
                    const nextIndex = (index + 1) % this.colors.length;
                    const localProgress = (progress * this.colors.length) % 1;

                    return app.lerp(this.colors[index], this.colors[nextIndex], localProgress);
                }
            };
        }
    };

    // Add gradient types to app for easy access
    app.colors.gradientTypes = gradientTypes;

    // Extend shapes with gradient support
    const originalShapes = app.shapes;

    app.shapes.gradientCircle = function(x, y, r, gradient) {
        return app.root.add({
            x, y, r, gradient,
            draw(ctx) {
                const fillStyle = this.gradient.apply(ctx, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.arc(0, 0, this.r, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    };

    app.shapes.gradientRect = function(x, y, w, h, gradient) {
        return app.root.add({
            x, y, w, h, gradient,
            draw(ctx) {
                const fillStyle = this.gradient.apply(ctx, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
                ctx.fillStyle = fillStyle;
                ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            }
        });
    };

    // Add a sample palette display object
    app.shapes.paletteDisplay = function(x, y, paletteName, width = 200, height = 40) {
        const palette = app.colors.getPalette(paletteName);
        if (!palette) return null;

        const swatchWidth = width / palette.length;

        return app.root.add({
            x, y, width, height, palette,
            draw(ctx) {
                this.palette.forEach((color, index) => {
                    ctx.fillStyle = color;
                    ctx.fillRect(
                        -this.width / 2 + index * swatchWidth,
                        -this.height / 2,
                        swatchWidth,
                        this.height
                    );
                });

                // Border
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            }
        });
    };
}
