/**
 * Plugin-based SVG Utility
 * Usage:
 *   SVG.use(plugin1, plugin2);
 *   const svg = SVG.create({ width: 200, height: 100 });
 */
export const SVG = (() => {
  // Private plugin registry
  const plugins = new Map();
  
  // Core wrapper constructor
  class SVGWrapper {
    constructor(el) {
      this.el = el;
      this._plugins = new Map(); // Instance-specific plugin state
      
      // Apply plugins to this instance
      for (const [name, plugin] of plugins) {
        if (typeof plugin.init === 'function') {
          plugin.init(this);
        }
      }
    }

    // Core methods (unchanged from original)
    attr(attrs) {
      SVG.setAttributes(this.el, attrs);
      return this;
    }

    add(tag, attrs = {}) {
      const child = document.createElementNS('http://www.w3.org/2000/svg', tag);
      SVG.setAttributes(child, attrs);
      this.el.appendChild(child);
      return new SVGWrapper(child);
    }

    // ... (other core methods: remove, bbox, on, etc.)
  }

  // Core static methods
  const core = {
    create(attrs = {}) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      core.setAttributes(svg, {
        xmlns: 'http://www.w3.org/2000/svg',
        ...attrs
      });
      return new SVGWrapper(svg);
    },

    wrap(el) {
      return el ? new SVGWrapper(el) : null;
    },

    setAttributes(el, attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (value != null) el.setAttribute(key, String(value));
      });
    },

    // Plugin registration
    use(...newPlugins) {
      newPlugins.forEach(plugin => {
        if (plugin.name && !plugins.has(plugin.name)) {
          plugins.set(plugin.name, plugin);
        }
      });
      return core;
    },

    // Optional: Get registered plugins
    getPlugins() {
      return [...plugins.keys()];
    }
  };

  return core;
})();
