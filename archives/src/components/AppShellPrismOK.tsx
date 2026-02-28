// ArticleReaderWithPrism.jsx

import { css } from 'goober';
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue';

// Prism loader
let prismReady = false;
let prismPromise = null;

function loadPrism() {
  if (prismReady) return Promise.resolve();
  if (prismPromise) return prismPromise;

  prismPromise = new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
    script.setAttribute('data-manual', '');
    script.onload = () => {
      const langs = [
        'javascript',
        'typescript',
        'python',
        'rust',
        'go',
        'c',
        'cpp',
        'java',
        'css',
        'html',
        'json',
        'bash',
      ];
      Promise.all(
        langs.map((lang) => {
          return new Promise((res) => {
            const s = document.createElement('script');
            s.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
            s.onload = s.onerror = res;
            document.head.appendChild(s);
          });
        }),
      ).then(() => {
        prismReady = true;
        resolve();
      });
    };
    document.head.appendChild(script);
  });

  return prismPromise;
}

// Dedent utility for raw HTML content
function dedent(str) {
  const lines = str.split('\n');
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)[0].length);
  const min = Math.min(...indents);
  return lines
    .map((l) => l.slice(min))
    .join('\n')
    .trim();
}

// Process article content
async function processContent(html) {
  await loadPrism();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('pre > code').forEach((code) => {
    const lang = (code.className.match(/language-(\w+)/) || [])[1] || 'text';
    const text = code.textContent;

    if (window.Prism?.languages[lang]) {
      const highlighted = window.Prism.highlight(
        text,
        window.Prism.languages[lang],
        lang,
      );
      code.innerHTML = highlighted;
      code.parentElement.className = `language-${lang}`;
      code.className = `language-${lang}`;
    }
  });

  return doc.body.innerHTML;
}

export default defineComponent({
  name: 'ArticleReader',
  props: {
    articles: {
      type: Array,
      default: () => [
        {
          id: '1',
          title: 'Memory Layout in 2025',
          date: 'January 10, 2025',
          content: dedent(`
            <h2>Understanding Modern Memory</h2>
            <p>Modern operating systems use virtual memory.</p>
            <pre><code class="language-c">#include &lt;stdio.h&gt;
            int main() {
                printf("Hello\\n");
                return 0;
            }</code></pre>
            <pre><code class="language-rust">fn main() {
                println!("Rust!");
            }</code></pre>
          `),
          references: [
            {
              authors: 'Tanenbaum, A.',
              title: 'Modern OS',
              journal: 'Pearson',
              year: '2023',
            },
          ],
        },
        {
          id: '2',
          title: 'Async JavaScript',
          date: 'January 15, 2025',
          content: dedent(`
            <h2>Async Patterns</h2>
            <pre><code class="language-javascript">async function fetch() {
              const res = await getData();
              return res;
            }</code></pre>
          `),
          references: [],
        },
      ],
    },
  },
  setup(props) {
    const selectedId = ref(null);
    const article = computed(() =>
      props.articles.find((a) => a.id === selectedId.value),
    );
    const html = ref('');
    const loading = ref(false);

    watch(article, async (art) => {
      if (!art) {
        html.value = '';
        return;
      }
      loading.value = true;
      html.value = await processContent(art.content);
      loading.value = false;
      await nextTick();
    });

    function open(id) {
      selectedId.value = id;
      document.body.style.overflow = 'hidden';
    }

    function close() {
      selectedId.value = null;
      document.body.style.overflow = '';
    }

    onBeforeUnmount(() => {
      document.body.style.overflow = '';
    });

    return () => (
      <div class={s.app}>
        <h1 class={s.title}>Articles</h1>
        <div class={s.list}>
          {props.articles.map((a) => (
            <div key={a.id} class={s.card} onClick={() => open(a.id)}>
              <h3>{a.title}</h3>
              <div class={s.date}>{a.date}</div>
            </div>
          ))}
        </div>

        {article.value && (
          <div
            class={s.backdrop}
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div class={s.reader}>
              <div class={s.header}>
                <button onClick={close} class={s.back}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
                <div>
                  <h3 class={s.readerTitle}>{article.value.title}</h3>
                  <div class={s.date}>{article.value.date}</div>
                </div>
              </div>

              <div class={s.body}>
                {loading.value ? (
                  <div class={s.loading}>
                    <div class={s.spinner}></div> Loading…
                  </div>
                ) : (
                  <div innerHTML={html.value}></div>
                )}

                {article.value.references?.length > 0 && (
                  <div class={s.refs}>
                    <strong>References</strong>
                    <ul>
                      {article.value.references.map((r, i) => (
                        <li key={i}>
                          {r.authors} — {r.title} ({r.year})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
});

const s = {
  app: css`min-height:100vh;padding:28px;max-width:1100px;margin:0 auto;font-family:Inter,system-ui;color:#e6eef8;background:#0a0e1a;`,
  title: css`font-size:20px;font-weight:700;margin:0 0 18px;color:#f1f8ff;`,
  list: css`display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;`,
  card: css`background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.03);padding:14px;border-radius:12px;cursor:pointer;transition:transform 160ms,box-shadow 160ms;box-shadow:0 6px 18px rgba(2,6,23,0.6);&:hover{transform:translateY(-6px);box-shadow:0 12px 30px rgba(2,6,23,0.7);} h3{font-size:15px;font-weight:700;margin:0 0 8px;color:#eaf4ff;}`,
  date: css`font-size:12px;color:rgba(230,240,255,0.65);`,
  backdrop: css`position:fixed;inset:0;background:rgba(2,6,23,0.92);display:flex;z-index:1400;`,
  reader: css`width:100%;height:100%;display:flex;flex-direction:column;background:linear-gradient(180deg,#071025,#04121a);overflow:auto;`,
  header: css`height:64px;display:flex;align-items:center;gap:12px;padding:0 18px;border-bottom:1px solid rgba(255,255,255,0.04);`,
  back: css`width:44px;height:44px;border-radius:10px;border:none;background:transparent;cursor:pointer;color:#cfe7ff;display:flex;align-items:center;justify-content:center;&:hover{background:rgba(255,255,255,0.03);}`,
  readerTitle: css`margin:0;font-size:16px;font-weight:700;color:#e6f0ff;`,
  body: css`padding:36px 28px;max-width:900px;margin:0 auto 80px;font-size:18px;line-height:1.8;color:#d7e7fb; h2{font-size:26px;color:#f6fbff;margin:28px 0 12px;} h3{font-size:20px;color:#f6fbff;margin:24px 0 12px;} p{margin:12px 0;} code:not(pre code){background:rgba(255,255,255,0.05);padding:3px 7px;border-radius:5px;font-family:monospace;font-size:0.92em;color:#a7d7ff;} pre{margin:20px 0;border-radius:10px;overflow:auto;border:1px solid rgba(255,255,255,0.05);background:#1a1f2e!important;} pre code{display:block;padding:16px;font-family:monospace;font-size:14px;line-height:1.7;background:transparent!important;}`,
  loading: css`display:flex;align-items:center;gap:12px;padding:24px;color:rgba(230,240,255,0.7);`,
  spinner: css`width:16px;height:16px;border:2px solid rgba(255,255,255,0.1);border-top-color:rgba(255,255,255,0.6);border-radius:50%;animation:spin 0.6s linear infinite;@keyframes spin{to{transform:rotate(360deg);}}`,
  refs: css`margin-top:32px;padding:16px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);color:rgba(230,240,255,0.85); strong{display:block;margin-bottom:8px;color:#f1f8ff;} ul{margin:0;padding-left:20px;} li{margin:6px 0;font-size:14px;}`,
};
