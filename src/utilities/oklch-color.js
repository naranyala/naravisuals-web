// oklch-color.js
export const Color = {
  hexToRgb(hex) {
    const v = parseInt(hex.slice(1), 16);
    return { r: v >> 16, g: (v >> 8) & 255, b: v & 255 };
  },

  rgbToOklch(r, g, b) {
    // Simplified linear sRGB → OKLCH (good enough for UI)
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const a = -0.2119034982 * r + 0.6806995451 * g + -0.4687960469 * b;
    const b_ = -0.0883024618 * r + 0.2817188376 * g + 0.8065835623 * b;
    const c = Math.hypot(a, b_);
    const h = Math.atan2(b_, a) * 180 / Math.PI;
    return { l: l / 255, c: c / 255, h: h < 0 ? h + 360 : h };
  },

  oklch(l, c, h, alpha = 1) {
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)} / ${alpha})`;
  },

  contrastRatio(c1, c2) {
    const l1 = this.luminance(c1), l2 = this.luminance(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  },

  luminance(hex) {
    const { r, g, b } = this.hexToRgb(hex);
    const [rs, gs, bs] = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  readableOn(bg) {
    return this.contrastRatio(bg, '#000') > 4.5 ? '#000' : '#fff';
  }
};
