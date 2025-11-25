// clipboard-image.js
export async function copyCanvasToClipboard(canvas) {
  if (navigator.clipboard?.write) {
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  } else {
    canvas.toBlob(blob => blob && navigator.clipboard.writeText(URL.createObjectURL(blob)));
  }
}

export async function pasteImageFromClipboard(callback) {
  if (navigator.clipboard?.read) {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
        const blob = await item.getType(item.types.find(t => t.startsWith('image/')));
        const img = new Image();
        img.onload = () => callback(img);
        img.src = URL.createObjectURL(blob);
        return;
      }
    }
  }
  // Fallback: listen once
  document.addEventListener('paste', function handler(e) {
    const file = e.clipboardData?.files[0];
    if (file?.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => callback(img);
      img.src = URL.createObjectURL(file);
    }
    document.removeEventListener('paste', handler);
  }, { once: true });
}
