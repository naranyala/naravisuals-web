export const MathExprPlugin = {
  name: 'math',
  init(wrapper) {
    // Safely evaluate math expressions with time/context
    wrapper.evalAttr = (attrMap, context = {}) => {
      const time = context.t || performance.now() / 1000;
      const safeEval = (expr) => {
        try {
          // Allow only math functions + time
          return Function(
            't', 'sin', 'cos', 'tan', 'sqrt', 'abs', 'PI', 'E', 'random',
            `return (${expr})`
          )(
            time,
            Math.sin, Math.cos, Math.tan, Math.sqrt, Math.abs,
            Math.PI, Math.E, Math.random
          );
        } catch (e) {
          console.warn('Invalid expression:', expr, e);
          return 0;
        }
      };

      const resolved = {};
      for (const [key, val] of Object.entries(attrMap)) {
        resolved[key] = typeof val === 'string' ? safeEval(val) : val;
      }
      wrapper.attr(resolved);
      return wrapper;
    };
  }
};

// const circle = svg.add('circle', { cx: 150, cy: 100, r: 10 });
// // Animate radius as sine wave
// setInterval(() => {
//   circle.evalAttr({ r: "abs(sin(t * 2)) * 40 + 10" });
// }, 16);
