export const PathMorphPlugin = {
  name: 'pathMorph',
  init(wrapper) {
    if (wrapper.el.tagName !== 'path') return;

    wrapper.morphTo = (targetD, duration = 800) => {
      // Lazy-load anime if not present
      if (typeof anime === 'undefined') {
        console.error('PathMorphPlugin requires anime.js');
        return wrapper;
      }

      anime({
        targets: wrapper.el,
        d: targetD,
        duration: duration,
        easing: 'easeOutQuad'
      });
      return wrapper;
    };
  }
};
