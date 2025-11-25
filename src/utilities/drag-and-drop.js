// drag-drop-zone.js
export function makeDropZone(element, onFiles) {
  element.style.position = 'relative';
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute; inset: 0; background: rgba(0,150,255,0.1);
    border: 4px dashed #0066ff; border-radius: 12px;
    opacity: 0; pointer-events: none; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
    font: bold 2rem sans-serif; color: #0066ff;
  `;
  overlay.textContent = 'Drop files here';
  element.appendChild(overlay);

  ['dragenter', 'dragover'].forEach(e => element.addEventListener(e, () => {
    overlay.style.opacity = '1'; overlay.style.pointerEvents = 'auto';
  }));
  ['dragleave', 'drop'].forEach(e => element.addEventListener(e, () => {
    overlay.style.opacity = '0';
  }));

  element.addEventListener('drop', e => {
    e.preventDefault();
    const files = [...e.dataTransfer.files];
    if (files.length) {
      onFiles(files);
      // Optional preview
      files.forEach(f => {
        if (f.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(f);
          img.style.cssText = 'max-width:200px; margin:8px; border-radius:8px;';
          element.appendChild(img);
        }
      });
    }
  });

  element.addEventListener('dragover', e => e.preventDefault());
}
