
export function trimText(
  text,
  {
    whitespace = true,
    chars,
    lines,
    length,
    ellipsis = true,
    html,
    pattern,
  } = {}
) {
  let result = text;

  if (whitespace) result = result.trim();
  if (chars) result = result.replace(new RegExp(`^[${chars}]+|[${chars}]+$`, 'g'), '');
  if (lines) result = result.replace(/^\s*\n|\n\s*$/g, '');
  if (length && result.length > length) {
    result = result.substring(0, length) + (ellipsis ? '...' : '');
  }
  if (html) result = result.replace(/^<[^>]+>|<[^>]+>$/g, '');
  if (pattern) result = result.replace(pattern, '');

  return result;
}
