import { defineComponent, ref, computed, watch, nextTick } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';
import { processMarkdownWithShiki } from '../shikiProcessor';


// Dedent utility
function dedent(str) {
  const lines = str.split('\n');
  const indents = lines.filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length);
  const min = Math.min(...indents);
  return lines.map(l => l.slice(min)).join('\n').trim();
}

const defaultArticles = [
  {
    id: '1',
    title: 'Memory Layout in 2025',
    date: 'Jan 10, 2025',
    tags: ['memory', 'c', 'systems', 'low-level'],
    content: dedent(`
      ## Understanding Modern Memory

      Modern operating systems use virtual memory.

      \`\`\`c
      #include <stdio.h>
      int main() {
          printf("Hello\\n");
          return 0;
      }
      \`\`\`
    `)
  },
  {
    id: '2',
    title: 'Async JavaScript',
    date: 'Jan 15, 2025',
    tags: ['javascript', 'async', 'web'],
    content: dedent(`
      ## Async Patterns

      \`\`\`javascript
      async function fetchData() {
        const res = await getData();
        return res;
      }
      \`\`\`
    `)
  },
  {
    id: '3',
    title: 'Advanced Rust',
    date: 'Jan 20, 2025',
    tags: ['rust', 'ownership', 'systems', 'safety'],
    content: dedent(`
      ## Ownership in Rust

      Rust's ownership system ensures memory safety.

      \`\`\`rust
      fn main() {
          let s = String::from("hello");
          println!("{}", s);
      }
      \`\`\`
    `)
  },
  {
    id: '4',
    title: 'Python Basics',
    date: 'Jan 30, 2025',
    tags: ['python', 'basics', 'scripting'],
    content: dedent(`
      ## Python Functions

      Python makes it easy to write clean code.

      \`\`\`python
      def greet(name):
          # Print a greeting
          return f"Hello, {name}!"

      print(greet("World"))
      \`\`\`
    `)
  }
];

const s = {
  app: css`min-height:min-content;padding:40px;max-width:1100px;margin:0 auto;font-family:system-ui;color:#e6eef8;`,
  title: css`font-size:20px;margin-bottom:18px;`,
  tagsContainer: css`display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;`,
  tag: css`padding:6px 12px;border-radius:20px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);font-size:13px;cursor:pointer;transition:all 0.2s;&:hover{background:rgba(255,255,255,0.15);}&.active{background:rgba(100,180,255,0.3);border-color:rgba(100,180,255,0.6);color:#fff;}`,
  clearBtn: css`align-self:flex-start;padding:6px 12px;font-size:13px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:rgba(230,240,255,0.7);border-radius:6px;cursor:pointer;&:hover{background:rgba(255,255,255,0.1);color:#fff;}`,
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
    h3{font-size:20px;color:#e6f2ff;margin:16px 0 10px;}
    p{margin:12px 0;}
    code:not(pre code){background:rgba(255,255,255,0.05);padding:3px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;color:#a7d7ff;}
    pre{margin:16px 0;}
    pre.shiki{margin:0!important;background:transparent!important;}
  `,
  codeWrapper: css`position:relative;margin:16px 0;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);background:#0d1117;`,
  codeHeader: css`display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.02);border-bottom:1px solid rgba(255,255,255,0.05);`,
  codeLang: css`font-size:12px;color:rgba(230,240,255,0.5);text-transform:uppercase;font-weight:600;`,
  copyBtn: css`background:rgba(255,255,255,0.05);border:none;padding:6px 12px;border-radius:6px;color:rgba(230,240,255,0.7);cursor:pointer;font-size:12px;transition:all 0.2s;display:flex;align-items:center;gap:6px;&:hover{background:rgba(255,255,255,0.1);color:#fff;}&.copied{background:rgba(16,185,129,0.15);color:#10b981;}`,
  preCode: css`display:block;padding:14px;font-family:'Fira Code',monospace;font-size:14px;line-height:1.6;background:transparent!important;overflow-x:auto;`,
  loading: css`padding:20px;color:rgba(230,240,255,0.7);text-align:center;`
};

export default defineComponent({
  name: 'ArticleReader',
  props: {
    articles: {
      type: Array,
      default: () => defaultArticles
    }
  },
  setup(props) {
    const selected = ref<string | null>(null);
    const selectedTags = ref<string[]>([]);
    const html = ref('');
    const loading = ref(false);

    const allTags = computed(() => {
      const set = new Set<string>();
      props.articles.forEach((a: any) => a.tags?.forEach((t: string) => set.add(t)));
      return Array.from(set).sort();
    });

    const filtered = computed(() => {
      if (selectedTags.value.length === 0) return props.articles;
      return props.articles.filter((a: any) =>
        a.tags?.some((tag: string) => selectedTags.value.includes(tag))
      );
    });

    const article = computed(() => props.articles.find((a: any) => a.id === selected.value));

    const toggleTag = (tag: string) => {
      selectedTags.value = selectedTags.value.includes(tag)
        ? selectedTags.value.filter(t => t !== tag)
        : [...selectedTags.value, tag];
    };

    const clearFilters = () => { selectedTags.value = []; };

    watch(article, async (art: any) => {
      if (!art) {
        html.value = '';
        return;
      }

      loading.value = true;
      try {
        html.value = await processMarkdownWithShiki(art.content);
      } catch (err) {
        console.error('Failed to process markdown:', err);
        html.value = art.content; // fallback
      } finally {
        loading.value = false;
      }
    });

    const enhanceCodeBlocks = (el: HTMLElement) => {
      if (!el) return;

      el.querySelectorAll('pre').forEach(pre => {
        const code = pre.querySelector('code');
        if (!code || pre.parentElement?.classList.contains(s.codeWrapper)) return;

        const lang = code.getAttribute('data-lang') || 'text';

        const wrapper = document.createElement('div');
        wrapper.className = s.codeWrapper;

        const header = document.createElement('div');
        header.className = s.codeHeader;

        const langSpan = document.createElement('span');
        langSpan.className = s.codeLang;
        langSpan.textContent = lang;

        const copyBtn = document.createElement('button');
        copyBtn.className = s.copyBtn;
        copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg> Copy`;

        copyBtn.addEventListener('click', () => {
          const text = code.getAttribute('data-code') || code.textContent || '';
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg> Copied!`;
            copyBtn.classList.add('copied');
            setTimeout(() => {
              copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg> Copy`;
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        });

        header.appendChild(langSpan);
        header.appendChild(copyBtn);
        wrapper.appendChild(header);
        wrapper.appendChild(pre.cloneNode(true));
        pre.parentNode?.replaceChild(wrapper, pre);
      });
    };

    return () => (
      <div class={s.app}>
        <h3 class={s.title}>ARTICLES</h3>

        <div class={s.tagsContainer}>
          {allTags.value.map(tag => (
            <button
              key={tag}
              class={clsx(s.tag, { active: selectedTags.value.includes(tag) })}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
          {selectedTags.value.length > 0 && (
            <button class={s.clearBtn} onClick={clearFilters}>
              ❌
            </button>
          )}
        </div>

        <div class={s.list}>
          {filtered.value.map((a: any) => (
            <div
              key={a.id}
              class={s.card}
              onClick={() => selected.value = a.id}
              onMouseEnter={() => {
                // Optional: preload shiki on hover
                import('../shikiProcessor');
              }}
            >
              <h3 class={s.cardTitle}>{a.title}</h3>
              <div class={s.date}>{a.date}</div>
              <div style="margin-top:8px;font-size:12px;opacity:0.7;">
                {a.tags?.map((t: string) => <span key={t} style="margin-right:6px;">#{t}</span>)}
              </div>
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
                  <div class={s.loading}>Processing content with syntax highlighting...</div>
                ) : (
                  <div
                    ref={el => {
                      if (el && html.value) {
                        (el as HTMLElement).innerHTML = html.value;
                        nextTick(() => enhanceCodeBlocks(el as HTMLElement));
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
