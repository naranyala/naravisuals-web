// texturePlugin.js — Complete Texture & Sprite System v1.0
// • Image loading (single + atlas) • Sprite sheets • 9-slice • Tiling • Filters • Tint • Flip

export function texturePlugin(app) {
    // =============================================
    // Private helpers
    // =============================================
    const imageCache = new Map();        // url → HTMLImageElement
    const atlasCache = new Map();        // name → {img, frames, meta}

    const loadImage = (src) => {
        if (imageCache.has(src)) return imageCache.get(src);

        const img = new Image();
        img.crossOrigin = "anonymous";
        const promise = new Promise((resolve, reject) => {
            img.onload = () => { imageCache.set(src, img); resolve(img); };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        });
        img.src = src;
        imageCache.set(src, promise);
        return promise;
    };

    // =============================================
    // Public API – app.texture
    // =============================================
    app.texture = {
        // Load a single image → returns a texture object
        async load(src) {
            const img = await loadImage(src);
            return app.texture.fromImage(img, src);
        },

        // Create texture directly from an already-loaded Image/Canvas/Video
        fromImage(source, name = source.src || "texture") {
            const tex = {
                name,
                source,
                width: source.width || source.videoWidth,
                height: source.height || source.videoHeight,
                valid: true,

                // Draw full texture
                draw(ctx, x = 0, y = 0, opts = {}) {
                    if (!this.valid) return;
                    const {
                        width = this.width,
                        height = this.height,
                        alpha = 1,
                        tint = null,
                        flipX = false,
                        flipY = false,
                        rotation = 0,
                        anchorX = 0.5,
                        anchorY = 0.5
                    } = opts;

                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.translate(x, y);
                    ctx.rotate(rotation);
                    if (flipX || flipY) {
                        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
                    }
                    ctx.translate(-anchorX * width, -anchorY * height);

                    if (tint) {
                        ctx.fillStyle = tint;
                        ctx.globalCompositeOperation = "source-atop";
                        ctx.fillRect(0, 0, width, height);
                        ctx.globalCompositeOperation = "source-over";
                    }

                    ctx.drawImage(this.source, 0, 0, width, height);
                    ctx.restore();
                },

                // Create a sprite object (scene-graph ready)
                createSprite(opts = {}) {
                    const sprite = {
                        texture: this,
                        frameX: 0, frameY: 0, frameW: this.width, frameH: this.height,
                        flipX: false, flipY: false,
                        tint: null,
                        alpha: 1,
                        anchorX: 0.5, anchorY: 0.5,

                        draw(ctx) {
                            this.texture.draw(ctx, this.x ?? 0, this.y ?? 0, {
                                width: this.frameW,
                                height: this.frameH,
                                alpha: this.alpha,
                                tint: this.tint,
                                flipX: this.flipX,
                                flipY: this.flipY,
                                rotation: this.rotation ?? 0,
                                anchorX: this.anchorX,
                                anchorY: this.anchorY,
                                sourceX: this.frameX,
                                sourceY: this.frameY,
                                sourceW: this.frameW,
                                sourceH: this.frameH
                            });
                        }
                    };
                    makeTransform(sprite);
                    return app.root.add(sprite);
                }
            };

            // Override draw to support sub-rect (used by sprites & 9-slice)
            const originalDraw = tex.draw;
            tex.draw = (ctx, x, y, opts = {}) => {
                if (!tex.valid) return;
                const {
                    sourceX = 0, sourceY = 0,
                    sourceW = tex.width, sourceH = tex.height,
                    width = sourceW, height = sourceH
                } = opts;

                ctx.save();
                ctx.globalAlpha = opts.alpha ?? 1;
                ctx.translate(x, y);
                ctx.rotate(opts.rotation ?? 0);
                if (opts.flipX || opts.flipY) ctx.scale(opts.flipX ? -1 : 1, opts.flipY ? -1 : 1);
                ctx.translate(-(opts.anchorX ?? 0.5) * width, -(opts.anchorY ?? 0.5) * height);

                if (opts.tint) {
                    ctx.fillStyle = opts.tint;
                    ctx.globalCompositeOperation = "source-atop";
                    ctx.fillRect(0, 0, width, height);
                    ctx.globalCompositeOperation = "source-over";
                }

                ctx.drawImage(
                    tex.source,
                    sourceX, sourceY, sourceW, sourceH,
                    0, 0, width, height
                );
                ctx.restore();
            };

            return tex;
        },

        // Load sprite-sheet atlas (Aseprite, TexturePacker JSON-hash/array, simple grid)
        async loadAtlas(url, type = "auto") {
            const imgPromise = loadImage(url.replace(/\.json$/, "")); // assume .json next to image
            const jsonResp = await fetch(url);
            const data = await jsonResp.json();

            let img, frames = {}, meta = {};

            if (data.frames) {
                // TexturePacker JSON (hash or array)
                img = await imgPromise;
                if (Array.isArray(data.frames)) {
                    data.frames.forEach(f => frames[f.filename] = f.frame);
                } else {
                    frames = data.frames;
                    Object.keys(frames).forEach(k => {
                        const f = frames[k].frame;
                        frames[k] = { x: f.x, y: f.y, w: f.w, h: f.h };
                    });
                }
                meta = data.meta;
            } else if (data.meta?.app === "https://www.aseprite.org/") {
                // Aseprite format
                img = await imgPromise;
                data.frames.forEach((f, i) => {
                    const name = f.filename || `frame_${i.toString().padStart(4, "0")}`;
                    frames[name] = { x: f.frame.x, y: f.frame.y, w: f.frame.w, h: f.frame.h };
                });
                meta = data.meta;
            } else if (type === "grid" || !data.frames) {
                // Simple uniform grid fallback
                const cols = data.cols || 8;
                const rows = data.rows || 8;
                const frameW = data.frameWidth || 64;
                const frameH = data.frameHeight || 64;
                img = await loadImage(url);
                let index = 0;
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        frames[`${index++}`] = {
                            x: x * frameW,
                            y: y * frameH,
                            w: frameW,
                            h: frameH
                        };
                    }
                }
            }

            const atlas = { img, frames, meta };
            atlasCache.set(url, atlas);

            // Create named textures for each frame
            const textures = {};
            Object.keys(frames).forEach(name => {
                const r = frames[name];
                const tex = app.texture.fromImage(img, name);
                tex.frameRect = r;
                tex.draw = function(ctx, x, y, opts = {}) {
                    const o = { ...opts, sourceX: r.x, sourceY: r.y, sourceW: r.w, sourceH: r.h };
                    if (!o.width) o.width = r.w;
                    if (!o.height) o.height = r.h;
                    tex.constructor.prototype.draw.call(this, ctx, x, y, o);
                };
                textures[name] = tex;
            });

            atlas.textures = textures;
            return atlas;
        },

        // 9-slice (scaled borders) – perfect for UI
        nineSlice(texture, borders = [10, 10, 10, 10]) {
            const [top, right, bottom, left] = borders.map(Math.round);
            const sprite = {
                texture,
                borders: { top, right, bottom, left },
                setSize(w, h) { this.width = w; this.height = h; },

                draw(ctx) {
                    const tex = this.texture;
                    const b = this.borders;
                    const cw = tex.width - left - right;
                    const ch = tex.height - top - bottom;
                    const dw = this.width - left - right;
                    const dh = this.height - top - bottom;

                    // corners
                    tex.draw(ctx, this.x, this.y, { sourceX: 0, sourceY: 0, width: left, height: top });
                    tex.draw(ctx, this.x + this.width - right, this.y, { sourceX: tex.width - right, sourceY: 0, width: right, height: top });
                    tex.draw(ctx, this.x, this.y + this.height - bottom, { sourceX: 0, sourceY: tex.height - bottom, width: left, height: bottom });
                    tex.draw(ctx, this.x + this.width - right, this.y + this.height - bottom, { sourceX: tex.width - right, sourceY: tex.height - bottom, width: right, height: bottom });

                    // edges (tiled or stretched)
                    tex.draw(ctx, this.x + left, this.y, { sourceX: left, sourceY: 0, width: dw, height: top });
                    tex.draw(ctx, this.x + left, this.y + this.height - bottom, { sourceX: left, sourceY: tex.height - bottom, width: dw, height: bottom });
                    tex.draw(ctx, this.x, this.y + top, { sourceX: 0, sourceY: top, width: left, height: dh });
                    tex.draw(ctx, this.x + this.width - right, this.y + top, { sourceX: tex.width - right, sourceY: top, width: right, height: dh });

                    // center
                    tex.draw(ctx, this.x + left, this.y + top, { sourceX: left, sourceY: top, width: dw, height: dh });
                }
            };
            makeTransform(sprite);
            sprite.setSize ??= (w, h) => { sprite.width = w; sprite.height = h; };
            return app.root.add(sprite);
        },

        // Tiling background (infinite or fixed)
        tile(texture, { speedX = 0, speedY = 0, repeatX = true, repeatY = true } = {}) {
            const bg = {
                texture,
                offsetX: 0, offsetY: 0,
                speedX, speedY,

                update(dt) {
                    this.offsetX += this.speedX * dt;
                    this.offsetY += this.speedY * dt;
                    if (repeatX) this.offsetX %= this.texture.width;
                    if (repeatY) this.offsetY %= this.texture.height;
                },

                draw(ctx) {
                    const tex = this.texture;
                    const w = app.canvas.width, h = app.canvas.height;
                    const ox = repeatX ? this.offsetX % tex.width : this.offsetX;
                    const oy = repeatY ? this.offsetY % tex.height : this.offsetY;

                    for (let x = -tex.width; x < w + tex.width; x += tex.width) {
                        for (let y = -tex.height; y < h + tex.height; y += tex.height) {
                            tex.draw(ctx, x + ox, y + oy);
                        }
                    }
                }
            };
            return app.root.add(bg);
        }
    };

    // =============================================
    // Easy global helpers
    // =============================================
    app.loadTexture = app.texture.load;
    app.loadAtlas = app.texture.loadAtlas;

    // Auto-add texture support to all future objects
    const originalAdd = app.root.add;
    app.root.add = function(obj) {
        obj = originalAdd.call(this, obj);

        // Quick texture assign
        if (!obj.setTexture && obj.draw) {
            obj.texture = null;
            obj.setTexture = function(tex) {
                this.texture = tex;
                const oldDraw = this.draw;
                this.draw = function(ctx) {
                    if (this.texture) {
                        this.texture.draw(ctx, this.x ?? 0, this.y ?? 0, {
                            width: this.width ?? this.texture.width,
                            height: this.height ?? this.texture.height,
                            alpha: this.opacity ?? 1,
                            rotation: this.rotation ?? 0,
                            anchorX: this.anchorX ?? 0.5,
                            anchorY: this.anchorY ?? 0.5
                        });
                    }
                    oldDraw?.(ctx);
                };
                return this;
            };
        }

        return obj;
    };

    console.log("🖼️  texturePlugin v1.0 loaded — Images, atlases, 9-slice, tiling, tint, flip, and sprite helpers ready!");
}
