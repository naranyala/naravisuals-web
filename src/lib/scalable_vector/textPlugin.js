export const TextPlugin = {
  name: 'text',
  init(wrapper) {
    wrapper.text = (content, options = {}) => {
      const {
        x = 0,
        y = 0,
        anchor = 'start', // 'start' | 'middle' | 'end'
        baseline = 'baseline', // 'hanging', 'middle', etc.
        size = '16px',
        family = 'sans-serif',
        wrapAt = null // max width before wrapping
      } = options;

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.textContent = content;
      SVG.setAttributes(t, {
        x, y,
        'text-anchor': anchor,
        'dominant-baseline': baseline,
        'font-size': size,
        'font-family': family
      });

      // Simple word wrap (basic implementation)
      if (wrapAt && content.length * parseFloat(size) * 0.6 > wrapAt) {
        // Split into lines (naive word wrap)
        const words = content.split(' ');
        let line = '';
        t.innerHTML = ''; // Clear
        words.forEach(word => {
          const testLine = line + word + ' ';
          if (testLine.length * parseFloat(size) * 0.6 > wrapAt) {
            const tsp = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tsp.textContent = line.trim();
            tsp.setAttribute('x', x);
            tsp.setAttribute('dy', '1.2em');
            t.appendChild(tsp);
            line = word + ' ';
          } else {
            line = testLine;
          }
        });
        if (line) {
          const tsp = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tsp.textContent = line.trim();
          tsp.setAttribute('x', x);
          tsp.setAttribute('dy', line === content ? '0' : '1.2em');
          t.appendChild(tsp);
        }
      }

      wrapper.el.appendChild(t);
      return SVG.wrap(t);
    };
  }
};
