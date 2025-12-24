// ImprovedArticleReader.jsx
import { defineComponent, ref, computed, watch, onBeforeUnmount } from 'vue';
import { css } from 'goober';

/** Shiki highlighter singleton */
let shikiHighlighter = null;
let shikiPromise = null;

async function getShikiHighlighter() {
  if (shikiHighlighter) return shikiHighlighter;
  if (shikiPromise) return shikiPromise;

  shikiPromise = (async () => {
    const shiki = await import('shiki');
    shikiHighlighter = await shiki.getHighlighter({
      theme: 'nord',
      langs: ['javascript', 'typescript', 'python', 'rust', 'go', 'html', 'css', 'json', 'bash']
    });
    return shikiHighlighter;
  })();

  return shikiPromise;
}

/**
 * Enhanced HTML parser that extracts code blocks and their metadata
 * Returns: { html: string, codeBlocks: Array<{index, lang, code}> }
 */
function parseCodeBlocks(rawHtml) {
  if (!rawHtml) return { html: '', codeBlocks: [] };

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const codeBlocks = [];
  let blockIndex = 0;

  // Find all pre > code elements
  doc.querySelectorAll('pre > code').forEach((codeEl) => {
    const classAttr = codeEl.getAttribute('class') || '';
    const langMatch = classAttr.match(/language-([\w-]+)/) || classAttr.match(/lang-([\w-]+)/);
    const lang = (langMatch && langMatch[1]) || 'text';
    const code = codeEl.textContent || '';

    // Replace with placeholder
    const placeholder = `__CODE_BLOCK_${blockIndex}__`;
    const pre = codeEl.parentElement;
    if (pre) {
      const marker = doc.createElement('div');
      marker.setAttribute('data-code-placeholder', placeholder);
      pre.replaceWith(marker);
    }

    codeBlocks.push({ index: blockIndex, lang, code, placeholder });
    blockIndex++;
  });

  return {
    html: doc.body.innerHTML,
    codeBlocks
  };
}

/**
 * Highlight code blocks using Shiki
 * Returns highlighted HTML for each block
 */
async function highlightCodeBlocks(codeBlocks) {
  if (!codeBlocks.length) return [];

  const highlighter = await getShikiHighlighter();
  const highlighted = [];

  for (const block of codeBlocks) {
    try {
      // Get supported languages
      const langs = highlighter.getLoadedLanguages();
      const lang = langs.includes(block.lang) ? block.lang : 'text';

      const html = highlighter.codeToHtml(block.code, { lang });
      highlighted.push({ ...block, html });
    } catch (err) {
      console.warn(`Failed to highlight ${block.lang}:`, err);
      // Fallback to plain code
      highlighted.push({
        ...block,
        html: `<pre class="shiki"><code>${escapeHtml(block.code)}</code></pre>`
      });
    }
  }

  return highlighted;
}

/**
 * Merge highlighted code blocks back into HTML
 */
function mergeHighlightedCode(templateHtml, highlightedBlocks) {
  let result = templateHtml;

  for (const block of highlightedBlocks) {
    result = result.replace(
      `<div data-code-placeholder="${block.placeholder}"></div>`,
      block.html
    );
  }

  return result;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default defineComponent({
  name: 'ImprovedArticleReader',
  props: {
    articles: {
      type: Array,
      default: () => [
        {
          id: '1',
          slug: 'memory-layout-2025',
          title: 'Memory Layout and Virtual Address Spaces in 2025',
          date: 'January 10, 2025',
          content: `
            <h2>Understanding Modern Memory Models</h2>
            <p>Modern operating systems use sophisticated virtual memory layouts.</p>
            <pre><code class="language-c">int main() {
  printf("Hello World\\n");
  return 0;
}</code></pre>
            <h2>Key Concepts</h2>
            <pre><code class="language-rust">fn main() {
    println!("Memory safety!");
}</code></pre>
          `,
          references: [
            { authors: 'Tanenbaum, A.', title: 'Modern Operating Systems', journal: 'Pearson', year: '2023' }
          ]
        }
      ]
    }
  },
  setup(props) {
    const selectedId = ref(null);
    const selectedArticle = computed(() =>
      props.articles.find(a => a.id === selectedId.value) ?? null
    );

    const renderedHtml = ref('');
    const isHighlighting = ref(false);

    // Watch for article changes and highlight code
    watch(selectedArticle, async (article) => {
      if (!article) {
        renderedHtml.value = '';
        return;
      }

      isHighlighting.value = true;

      try {
        // Parse HTML and extract code blocks
        const { html, codeBlocks } = parseCodeBlocks(article.content);

        if (codeBlocks.length === 0) {
          // No code blocks, use content as-is
          renderedHtml.value = article.content;
        } else {
          // Highlight code blocks
          const highlighted = await highlightCodeBlocks(codeBlocks);
          // Merge back into HTML
          renderedHtml.value = mergeHighlightedCode(html, highlighted);
        }
      } catch (err) {
        console.error('Highlighting error:', err);
        renderedHtml.value = article.content;
      } finally {
        isHighlighting.value = false;
      }
    }, { immediate: true });

    function openArticle(id) {
      selectedId.value = id;
      document.body.style.overflow = 'hidden';
    }

    function closeReader() {
      selectedId.value = null;
      document.body.style.overflow = '';
    }

    onBeforeUnmount(() => {
      document.body.style.overflow = '';
    });

    const excerptFromContent = (html) => {
      const tmp = html.replace(/<[^>]+>/g, '');
      return tmp.length > 140 ? tmp.slice(0, 137) + '…' : tmp;
    };

    return () => (
      <div class={styles.app}>
        <div class={styles.header}>
          <h1 class={styles.pageTitle}>Articles</h1>
        </div>

        <div class={styles.list}>
          {props.articles.map((a) => (
            <article key={a.id} class={styles.card} onClick={() => openArticle(a.id)}>
              <h3 class={styles.cardTitle}>{a.title}</h3>
              <div class={styles.cardMeta}>{a.date}</div>
              <div class={styles.excerpt}>{excerptFromContent(a.content)}</div>
            </article>
          ))}
        </div>

        {selectedArticle.value && (
          <teleport to="body">
            <div class={styles.backdrop} onClick={(e) => {
              if (e.target === e.currentTarget) closeReader();
            }}>
              <div class={styles.reader}>
                <div class={styles.readerHeader}>
                  <button type="button" class={styles.backButton} onClick={closeReader}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <div class={styles.readerTitleWrap}>
                    <h3 class={styles.readerTitle}>{selectedArticle.value.title}</h3>
                    <div class={styles.readerDate}>{selectedArticle.value.date}</div>
                  </div>
                </div>

                <div class={styles.readerBody}>
                  {isHighlighting.value ? (
                    <div class={styles.loadingState}>
                      <div class={styles.spinner}></div>
                      <span>Highlighting code…</span>
                    </div>
                  ) : (
                    <div innerHTML={renderedHtml.value} />
                  )}

                  {selectedArticle.value.references?.length > 0 && (
                    <div class={styles.references}>
                      <strong>References</strong>
                      <ul>
                        {selectedArticle.value.references.map((r, i) => (
                          <li key={i}>
                            {r.authors} — {r.title} — {r.journal} ({r.year})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </teleport>
        )}
      </div>
    );
  }
});

const styles = {
  app: css`
    min-height: 100vh;
    padding: 28px;
    max-width: 1100px;
    margin: 0 auto;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    color: #e6eef8;
    -webkit-font-smoothing: antialiased;
  `,
  header: css`display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;`,
  pageTitle: css`margin:0;font-size:20px;font-weight:700;color:#f1f8ff;`,
  list: css`display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;`,
  card: css`
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.03);
    padding: 14px;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 160ms ease;
    box-shadow: 0 6px 18px rgba(2,6,23,0.6);
    &:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(2,6,23,0.7); }
  `,
  cardTitle: css`font-size:15px;font-weight:700;margin:0 0 8px 0;color:#eaf4ff;`,
  cardMeta: css`font-size:12px;color:rgba(230,240,255,0.65);`,
  excerpt: css`margin-top:10px;font-size:13px;color:rgba(230,240,255,0.78);line-height:1.45;`,

  backdrop: css`
    position: fixed; inset: 0; background: rgba(2,6,23,0.92);
    display: flex; align-items: stretch; justify-content: center;
    z-index: 1400; padding: 0;
  `,
  reader: css`
    width: 100%; height: 100%; display:flex; flex-direction:column;
    background: linear-gradient(180deg, #071025 0%, #04121a 100%);
    color: #e6eef8; overflow:auto;
  `,
  readerHeader: css`
    height: 64px; display:flex; align-items:center; gap:12px;
    padding: 0 18px; border-bottom: 1px solid rgba(255,255,255,0.04);
  `,
  backButton: css`
    display:inline-flex; align-items:center; justify-content:center;
    width:44px; height:44px; border-radius:10px; border:none; background:transparent;
    cursor:pointer; color:#cfe7ff; transition: background 120ms ease, transform 120ms ease;
    &:hover { background: rgba(255,255,255,0.03); transform: translateX(-2px); }
  `,
  readerTitleWrap: css`display:flex; flex-direction:column; gap:2px;`,
  readerTitle: css`margin:0;font-size:16px;font-weight:700;color:#e6f0ff;`,
  readerDate: css`font-size:12px;color:rgba(230,240,255,0.65);`,
  readerBody: css`
    padding: 36px 28px; max-width:900px; margin:0 auto 80px auto;
    font-size:18px; line-height:1.8; color:#d7e7fb;

    h1,h2,h3,h4 { color:#f6fbff; margin:28px 0 12px; line-height:1.15; font-weight:700; }
    h1{font-size:34px;} h2{font-size:26px;} h3{font-size:20px;}
    p{ margin:12px 0; color:#d7e7fb; font-size:18px; line-height:1.8; }
    ul,ol{ margin:12px 0 12px 20px; color:#d7e7fb; line-height:1.7; }

    code{
      background: rgba(255,255,255,0.03);
      padding:2px 6px;
      border-radius:6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size:0.95em;
      color:#e6f0ff;
    }

    pre {
      margin:18px 0;
      border-radius:10px;
      overflow:auto;
      border:1px solid rgba(255,255,255,0.03);
      box-shadow: 0 2px 8px rgba(2,6,23,0.45);
    }

    pre code {
      display:block;
      padding:14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size:13px;
      line-height:1.6;
      background: transparent;
    }
  `,
  loadingState: css`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    color: rgba(230,240,255,0.7);
    font-size: 14px;
  `,
  spinner: css`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.1);
    border-top-color: rgba(255,255,255,0.6);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
  references: css`
    margin-top:24px;
    padding:14px;
    border-radius:10px;
    background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border:1px solid rgba(255,255,255,0.03);
    color:rgba(230,240,255,0.85);
  `
};
