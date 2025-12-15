export const shapesPlugin = {
  name: 'shapes',
  init(wrapper) {
    // Only root <svg> gets creation methods
    if (wrapper.el.tagName !== 'svg') return;

    // Smart coordinate resolver (accepts numbers, points, or objects)
    const resolvePoint = (input, fallback = 0) => {
      if (typeof input === 'number') return input;
      if (Array.isArray(input)) return { x: input[0], y: input[1] };
      if (input && typeof input === 'object') return input;
      return fallback;
    };

    // Auto-close paths when logical
    const shouldClose = (tag) => ['polygon', 'rect', 'circle', 'ellipse'].includes(tag);

    // shape creator: handles all shapes with smart defaults
    wrapper.el.shapes = (type, ...args) => {
      let attrs = {};
      let content = '';

      // Parse args based on shape type
      switch (type) {
        // Circle: (cx, cy, r) or ({ cx, cy, r })
        case 'circle':
          if (args.length === 1 && typeof args[0] === 'object') {
            ({ cx: attrs.cx, cy: attrs.cy, r: attrs.r, ...attrs } = args[0]);
          } else {
            [attrs.cx, attrs.cy, attrs.r] = args;
          }
          break;

        // Rect: (x, y, width, height) or ({ x, y, w, h })
        case 'rect':
          if (args.length === 1 && typeof args[0] === 'object') {
            const { x, y, w, h, width, height, ...rest } = args[0];
            attrs = { x, y, width: width ?? w, height: height ?? h, ...rest };
          } else {
            [attrs.x, attrs.y, attrs.width, attrs.height] = args;
          }
          break;

        // Line: (x1, y1, x2, y2) or ([x1,y1], [x2,y2])
        case 'line':
          if (args.length === 2 && Array.isArray(args[0])) {
            [attrs.x1, attrs.y1] = args[0];
            [attrs.x2, attrs.y2] = args[1];
          } else if (args.length === 1 && typeof args[0] === 'object') {
            ({ x1: attrs.x1, y1: attrs.y1, x2: attrs.x2, y2: attrs.y2, ...attrs } = args[0]);
          } else {
            [attrs.x1, attrs.y1, attrs.x2, attrs.y2] = args;
          }
          break;

        // Text: (content, x, y) or (content, { x, y })
        case 'text':
          content = args[0];
          if (args.length === 2 && typeof args[1] === 'object') {
            ({ x: attrs.x, y: attrs.y, ...attrs } = args[1]);
          } else if (args.length >= 2) {
            [attrs.x, attrs.y] = args.slice(1);
          }
          break;

        // Path: (d) or ({ d })
        case 'path':
          if (typeof args[0] === 'string') {
            attrs.d = args[0];
          } else if (typeof args[0] === 'object') {
            ({ d: attrs.d, ...attrs } = args[0]);
          }
          break;

        // Generic fallback
        default:
          if (args[0] && typeof args[0] === 'object') attrs = args[0];
      }

      // Auto-position at origin if missing
      if (['circle', 'rect', 'text'].includes(type)) {
        if (attrs.x == null && attrs.cx == null) attrs.x = attrs.cx = 0;
        if (attrs.y == null && attrs.cy == null) attrs.y = attrs.cy = 0;
      }

      // Create element
      const el = document.createElementNS('http://www.w3.org/2000/svg', type);
      SVG.setAttributes(el, attrs);
      if (content) el.textContent = content;
      wrapper.el.appendChild(el);

      // Return wrapped for chaining + attach shapes creator to children too
      const wrapped = SVG.wrap(el);
      if (!wrapped.el.shapes) wrapped.el.shapes = wrapper.el.shapes;
      return wrapped;
    };

    // Alias common shapes as direct methods
    ['circle', 'rect', 'line', 'text', 'path', 'polygon', 'g'].forEach(type => {
      wrapper.el[type] = (...args) => wrapper.el.shapes(type, ...args);
    });

    // Group shorthand
    wrapper.el.g = (attrs = {}) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      SVG.setAttributes(g, attrs);
      wrapper.el.appendChild(g);
      return SVG.wrap(g);
    };
  }
};
