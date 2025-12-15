export const GradientPlugin = {
  name: 'gradients',
  init(wrapper) {
    // Only works on root <svg>
    if (wrapper.el.tagName !== 'svg') return;

    wrapper.linearGradient = (id, stops, options = {}) => {
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.id = id;
      if (options.x1) grad.setAttribute('x1', options.x1);
      if (options.y1) grad.setAttribute('y1', options.y1);
      if (options.x2) grad.setAttribute('x2', options.x2);
      if (options.y2) grad.setAttribute('y2', options.y2);

      stops.forEach(({ offset, color, opacity = 1 }) => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', offset);
        stop.setAttribute('stop-color', color);
        if (opacity !== 1) stop.setAttribute('stop-opacity', opacity);
        grad.appendChild(stop);
      });

      // Add to <defs> (create if needed)
      let defs = wrapper.el.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        wrapper.el.prepend(defs);
      }
      defs.appendChild(grad);
      return wrapper;
    };

    // Usage: wrapper.el.fill = 'url(#myGrad)';
  }
};
