// text-measure.js
export function measureText(text, font = '16px sans-serif', maxWidth = Infinity) {
  const canvas = measureText.canvas || (measureText.canvas = document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  ctx.font = font;

  const lines = [];
  if (ctx.measureText(text).width <= maxWidth) {
, {
    lines.push(text);
    return {
      width: ctx.measureText(text).width,
      height: parseFloat(font) * 1.2,
      lines: [text],
      lineHeight: parseFloat(font) * 1.2
    };
  }

  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line) lines.push(line.trim());

  const lineHeight = parseFloat(font) * 1.25;
  return {
    width: Math.max(...lines.map(l => ctx.measureText(l).width)),
    height: lines.length * lineHeight,
    lines,
    lineHeight
  };
}
