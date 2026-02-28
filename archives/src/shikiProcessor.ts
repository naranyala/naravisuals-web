// src/utils/shikiProcessor.ts
let shikiInstance: any = null;
let shikiPromise: Promise<any> | null = null;

async function loadShiki() {
  if (shikiInstance) return shikiInstance;
  if (shikiPromise) return shikiPromise;

  shikiPromise = (async () => {
    const { createHighlighter } = await import('shiki');
    shikiInstance = await createHighlighter({
      themes: ['github-dark'],
      langs: [
        'c',
        'rust',
        'javascript',
        'vue',
        'typescript',
        'bash',
        'json',
        'html',
        'css',
        'jsx',
        'tsx',
      ],
    });
    return shikiInstance;
  })();

  return shikiPromise;
}

export async function processMarkdownWithShiki(
  markdown: string,
): Promise<string> {
  const highlighter = await loadShiki();

  // First, convert markdown to HTML using marked
  const { marked } = await import('marked');
  const html = marked(markdown);

  // Parse HTML and highlight code blocks
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.querySelector('div')!;

  container.querySelectorAll('pre > code').forEach((codeElement) => {
    const langMatch = codeElement.className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : 'text';
    const codeText = codeElement.textContent || '';

    try {
      const highlighted = highlighter.codeToHtml(codeText, {
        lang,
        theme: 'github-dark',
      });

      // Extract inner <pre><code>...</code></pre> from Shiki output
      const temp = document.createElement('div');
      temp.innerHTML = highlighted;
      const newPre = temp.querySelector('pre');
      if (newPre) {
        // Replace the original pre>code with Shiki's highlighted version
        codeElement.innerHTML =
          newPre.querySelector('code')?.innerHTML || codeText;
        codeElement.className = `language-${lang}`;
        codeElement.setAttribute('data-lang', lang);
        codeElement.setAttribute('data-code', codeText);
      }
    } catch (e) {
      console.warn(`Shiki failed to highlight ${lang}:`, e);
      // Fallback: keep original
      codeElement.className = `language-${lang}`;
      codeElement.setAttribute('data-lang', lang);
      codeElement.setAttribute('data-code', codeText);
    }
  });

  return container.innerHTML;
}
