// Comprehensive color utilities
const ColorUtils = (() => {
  const parseHex = (hex) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    return parseInt(hex, 16);
  };

  return {
    // Color conversion
    hexToRgb(hex) {
      const value = parseHex(hex);
      return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255
      };
    },

    rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    },

    hslToRgb(h, s, l) {
      s /= 100;
      l /= 100;
      
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      
      let r, g, b;
      
      if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
      else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
      else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
      else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
      else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];
      
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      };
    },

    // Color manipulation
    lighten(hex, percent) {
      const rgb = this.hexToRgb(hex);
      const factor = 1 + (percent / 100);
      rgb.r = Math.min(255, Math.round(rgb.r * factor));
      rgb.g = Math.min(255, Math.round(rgb.g * factor));
      rgb.b = Math.min(255, Math.round(rgb.b * factor));
      return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    },

    darken(hex, percent) {
      const rgb = this.hexToRgb(hex);
      const factor = 1 - (percent / 100);
      rgb.r = Math.max(0, Math.round(rgb.r * factor));
      rgb.g = Math.max(0, Math.round(rgb.g * factor));
      rgb.b = Math.max(0, Math.round(rgb.b * factor));
      return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    },

    // Color analysis
    luminance(r, g, b) {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    contrast(color1, color2) {
      const rgb1 = this.hexToRgb(color1);
      const rgb2 = this.hexToRgb(color2);
      const lum1 = this.luminance(rgb1.r, rgb1.g, rgb1.b);
      const lum2 = this.luminance(rgb2.r, rgb2.g, rgb2.b);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    },

    // Random color generation
    randomHex() {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    },

    randomHsl(hueRange = [0, 360], saturation = 70, lightness = 60) {
      const hue = Math.floor(Math.random() * (hueRange[1] - hueRange[0])) + hueRange[0];
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
  };
})();
