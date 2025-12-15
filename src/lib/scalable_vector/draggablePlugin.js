export const DraggablePlugin = {
  name: 'draggable',
  init(wrapper) {
    let isDragging = false;
    let startX, startY, startTranslateX = 0, startTranslateY = 0;

    // Ensure element is transformable
    if (!wrapper.el.hasAttribute('transform')) {
      wrapper.el.setAttribute('transform', 'translate(0,0)');
    }

    const parseTransform = (str) => {
      const match = str.match(/translate\(([^,]+),([^)]+)\)/);
      return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : { x: 0, y: 0 };
    };

    const updateTransform = (x, y) => {
      wrapper.el.setAttribute('transform', `translate(${x},${y})`);
    };

    wrapper.draggable = (options = {}) => {
      const { onDragStart, onDrag, onDragEnd } = options;

      wrapper.el.style.cursor = 'move';
      wrapper.el.setAttribute('pointer-events', 'all');

      wrapper.el.addEventListener('mousedown', (e) => {
        isDragging = true;
        const current = parseTransform(wrapper.el.getAttribute('transform'));
        startTranslateX = current.x;
        startTranslateY = current.y;
        startX = e.clientX;
        startY = e.clientY;
        if (onDragStart) onDragStart(e, wrapper);
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        updateTransform(startTranslateX + dx, startTranslateY + dy);
        if (onDrag) onDrag(e, { dx, dy }, wrapper);
      });

      window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        if (onDragEnd) onDragEnd(e, wrapper);
      });

      return wrapper;
    };
  }
};
