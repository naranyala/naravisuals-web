import { defineComponent, ref, computed, watch, nextTick } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';

// Dedent utility
function dedent(str) {
  const lines = str.split('\n');
  const indents = lines.filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length);
  const min = Math.min(...indents);
  return lines.map(l => l.slice(min)).join('\n').trim();
}

// Shiki loader
let shikiInstance = null;
let shikiPromise = null;

async function loadShiki() {
  if (shikiInstance) return shikiInstance;
  if (shikiPromise) return shikiPromise;

  shikiPromise = (async () => {
    const shiki = await import('https://esm.sh/shiki@latest');
    shikiInstance = await shiki.getHighlighter({
      themes: ['github-dark'],
      // langs: ['javascript', 'typescript', 'python', 'rust', 'go', 'c', 'cpp', 'java', 'css', 'html', 'json', 'bash']
      langs: ['c', 'rust', 'c3']
    });
    return shikiInstance;
  })();

  return shikiPromise;
}

async function processContent(html) {
  const highlighter = await loadShiki();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('pre > code').forEach(code => {
    const lang = (code.className.match(/language-(\w+)/) || [])[1] || 'text';
    const text = code.textContent;

    try {
      const highlighted = highlighter.codeToHtml(text, {
        lang: lang,
        theme: 'github-dark'
      });

      // Extract just the code part from shiki's output
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = highlighted;
      const preElement = tempDiv.querySelector('pre');

      if (preElement) {
        code.innerHTML = preElement.querySelector('code')?.innerHTML || text;
        code.className = `language-${lang}`;
        code.setAttribute('data-lang', lang);
        code.setAttribute('data-code', text);
      }
    } catch (e) {
      console.warn(`Failed to highlight ${lang}:`, e);
      code.textContent = text;
      code.className = `language-${lang}`;
      code.setAttribute('data-lang', lang);
      code.setAttribute('data-code', text);
    }
  });

  return doc.body.innerHTML;
}

const defaultArticles = [
  {
    id: '1',
    title: 'Memory Layout in 2025',
    date: 'Jan 10, 2025',
    content: dedent(`
      <h2>Understanding Modern Memory</h2>
      <p>Modern operating systems use virtual memory.</p>
      <pre><code class="language-c">#include <stdio.h>
int main() {
    printf("Hello\\n");
    return 0;
}</code></pre>
    `)
  },
  {
    id: '2',
    title: 'Async JavaScript',
    date: 'Jan 15, 2025',
    content: dedent(`
      <h2>Async Patterns</h2>
      <pre><code class="language-javascript">async function fetchData() {
  const res = await getData();
  return res;
}</code></pre>
    `)
  },
  {
    id: '3',
    title: 'Advanced Rust',
    date: 'Jan 20, 2025',
    content: dedent(`
      <h2>Ownership in Rust</h2>
      <p>Rust's ownership system ensures memory safety.</p>
      <pre><code class="language-rust">fn main() {
    let s = String::from("hello");
    println!("{}", s);
}</code></pre>
    `)
  },
  {
    id: '4',
    title: 'Python Basics',
    date: 'Jan 30, 2025',
    content: dedent(`
      <h2>Python Functions</h2>
      <p>Python makes it easy to write clean code.</p>
      <pre><code class="language-python">def greet(name):
    # Print a greeting
    return f"Hello, {name}!"

print(greet("World"))</code></pre>
    `)
  }
];

const s = {
  app: css`min-height:100vh;padding:28px;max-width:1100px;margin:0 auto;font-family:system-ui;color:#e6eef8;background:#0a0e1a;`,
  title: css`font-size:20px;margin-bottom:18px;`,
  search: css`width:100%;padding:12px;margin-bottom:20px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#e6eef8;font-size:14px;&:focus{outline:none;border-color:rgba(100,180,255,0.4);}`,
  list: css`display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;`,
  card: css`background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:14px;border-radius:10px;cursor:pointer;transition:transform 0.2s;&:hover{transform:translateY(-4px);}`,
  cardTitle: css`font-size:15px;margin-bottom:8px;`,
  date: css`font-size:12px;color:rgba(230,240,255,0.6);`,
  modal: css`position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;z-index:100;`,
  reader: css`width:100%;height:100%;display:flex;flex-direction:column;background:#0f1420;overflow:auto;`,
  header: css`padding:18px;border-bottom:1px solid rgba(255,255,255,0.05);`,
  btn: css`background:rgba(255,255,255,0.1);border:none;padding:8px 16px;border-radius:6px;color:#e6eef8;cursor:pointer;&:hover{background:rgba(255,255,255,0.15);}`,
  readerTitle: css`margin:8px 0 0;font-size:18px;`,
  body: css`padding:28px;max-width:800px;margin:0 auto;font-size:16px;line-height:1.8;color:#d7e7fb;
    h2{font-size:24px;color:#f6fbff;margin:20px 0 12px;}
    p{margin:12px 0;}
    code:not(pre code){background:rgba(255,255,255,0.05);padding:3px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;color:#a7d7ff;}
  `,
  codeWrapper: css`position:relative;margin:16px 0;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);background:#0d1117;`,
  codeHeader: css`display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.02);border-bottom:1px solid rgba(255,255,255,0.05);`,
  codeLang: css`font-size:12px;color:rgba(230,240,255,0.5);text-transform:uppercase;font-weight:600;`,
  copyBtn: css`background:rgba(255,255,255,0.05);border:none;padding:6px 12px;border-radius:6px;color:rgba(230,240,255,0.7);cursor:pointer;font-size:12px;transition:all 0.2s;display:flex;align-items:center;gap:6px;&:hover{background:rgba(255,255,255,0.1);color:#fff;}&.copied{background:rgba(16,185,129,0.15);color:#10b981;}`,
  pre: css`margin:0!important;background:transparent!important;`,
  preCode: css`display:block;padding:14px;font-family:'Fira Code',monospace;font-size:14px;line-height:1.6;background:transparent!important;overflow-x:auto;`,
  loading: css`padding:20px;color:rgba(230,240,255,0.7);text-align:center;`
};

function CodeBlock({ code, lang }) {
  const copied = ref(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      copied.value = true;
      setTimeout(() => copied.value = false, 2000);
    });
  };

  return (
    <div class={s.codeWrapper}>
      <div class={s.codeHeader}>
        <span class={s.codeLang}>{lang}</span>
        <button class={clsx(s.copyBtn, copied.value && 'copied')} onClick={copyCode}>
          {copied.value ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre class={s.pre}>
        <code class={s.preCode} innerHTML={code}></code>
      </pre>
    </div>
  );
}

export default defineComponent({
  name: 'ArticleReader',
  props: {
    articles: {
      type: Array,
      default: () => defaultArticles
    }
  },
  setup(props) {
    const selected = ref(null);
    const search = ref('');
    const html = ref('');
    const loading = ref(false);
    const codeBlocks = ref([]);

    const filtered = computed(() =>
      props.articles.filter(a => a.title.toLowerCase().includes(search.value.toLowerCase()))
    );

    const article = computed(() => props.articles.find(a => a.id === selected.value));

    watch(article, async (art) => {
      if (!art) {
        html.value = '';
        codeBlocks.value = [];
        return;
      }
      loading.value = true;
      const processed = await processContent(art.content);
      html.value = processed;

      // Extract code blocks for proper rendering
      await nextTick();
      const parser = new DOMParser();
      const doc = parser.parseFromString(processed, 'text/html');
      codeBlocks.value = Array.from(doc.querySelectorAll('pre > code')).map(code => ({
        lang: code.getAttribute('data-lang') || 'text',
        code: code.getAttribute('data-code') || code.textContent,
        html: code.innerHTML
      }));

      loading.value = false;
    });

    return () => (
      <div class={s.app}>
        <h1 class={s.title}>Articles</h1>

        <input
          type="text"
          placeholder="Search..."
          value={search.value}
          onInput={e => search.value = e.target.value}
          class={s.search}
        />

        <div class={s.list}>
          {filtered.value.map(a => (
            <div key={a.id} class={s.card} onClick={() => selected.value = a.id}>
              <h3 class={s.cardTitle}>{a.title}</h3>
              <div class={s.date}>{a.date}</div>
            </div>
          ))}
        </div>

        {article.value && (
          <div class={s.modal} onClick={e => e.target === e.currentTarget && (selected.value = null)}>
            <div class={s.reader}>
              <div class={s.header}>
                <button class={s.btn} onClick={() => selected.value = null}>← Back</button>
                <h2 class={s.readerTitle}>{article.value.title}</h2>
                <div class={s.date}>{article.value.date}</div>
              </div>

              <div class={s.body}>
                {loading.value ? (
                  <div class={s.loading}>Loading syntax highlighting...</div>
                ) : (
                  <>
                    {/* Render content with code blocks replaced */}
                    <div>
                      {html.value.split(/<pre>.*?<\/pre>/gs).map((part, i) => (
                        <span key={i}>
                          <div innerHTML={part}></div>
                          {codeBlocks.value[i] && (
                            <CodeBlock
                              code={codeBlocks.value[i].code}
                              lang={codeBlocks.value[i].lang}
                              key={`code-${i}`}
                            />
                          )}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
