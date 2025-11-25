// virtual-scroller.js
export function virtualScroller({ itemHeight, totalItems, renderItem, container = document.body }) {
  const viewport = document.createElement('div');
  viewport.style.height = '100vh';
  viewport.style.overflow = 'auto';
  container.appendChild(viewport);

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  viewport.appendChild(canvas);

  let startIndex = 0;
  const visibleCount = Math.ceil(innerHeight / itemHeight) + 5;

  const render = () => {
    canvas.height = totalItems * itemHeight;
    canvas.width = viewport.clientWidth;

    const yOffset = startIndex * itemHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < visibleCount && startIndex + i < totalItems; i++) {
      renderItem(ctx, startIndex + i, 0, -yOffset + i * itemHeight, canvas.width, itemHeight);
    }
  };

  viewport.addEventListener('scroll', () => {
    startIndex = Math.floor(viewport.scrollTop / itemHeight);
    render();
  });

  window.addEventListener('resize', render);
  render();

  return { destroy: () => viewport.remove() };
}
