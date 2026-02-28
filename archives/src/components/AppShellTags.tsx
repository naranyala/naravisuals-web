import clsx from 'clsx';
import { css } from 'goober';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { processMarkdownWithShiki } from '../shikiProcessor';

function slugify(title) {
  return title
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

function dedent(str: string): string {
  const lines = str.split('\n');
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)![0].length);
  const min = Math.min(...indents, Infinity);
  return lines
    .map((l) => l.slice(min))
    .join('\n')
    .trim();
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
    `),
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
    `),
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
    `),
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
    `),
  },
];

const s = {
  app: css`
    min-height: 100vh;
    padding: 20px 16px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: system-ui, sans-serif;
    color: #e6eef8;
    background: #0a0e1a;
    @media (min-width: 640px) { padding: 28px 24px; }
    @media (min-width: 1024px) { padding: 32px 40px; }
  `,
  title: css`
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
    @media (min-width: 768px) { font-size: 28px; text-align: left; }
  `,
  tagsContainer: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    @media (min-width: 640px) { overflow-x: visible; }
  `,
  tag: css`
    padding: 8px 14px;
    border-radius: 20px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    &:hover { background: rgba(255,255,255,0.15); }
    &.active { background: rgba(100,180,255,0.3); border-color: rgba(100,180,255,0.6); color: #fff; }
  `,
  clearBtn: css`
    padding: 8px 14px;
    font-size: 14px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    color: rgba(230,240,255,0.7);
    border-radius: 20px;
    cursor: pointer;
    &:hover { background: rgba(255,255,255,0.1); color: #fff; }
  `,
  list: css`
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); gap: 20px; }
    @media (min-width: 900px) { grid-template-columns: repeat(3, 1fr); }
    @media (min-width: 1200px) { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
  `,
  card: css`
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 16px;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    &:hover { transform: translateY(-6px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
  `,
  cardTitle: css`font-size: 17px; margin-bottom: 8px; line-height: 1.3;`,
  date: css`font-size: 13px; color: rgba(230,240,255,0.6); margin-bottom: 12px;`,
  modal: css`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    display: flex;
    z-index: 100;
    justify-content: center;
    align-items: stretch;
    padding: 0;
    margin: 0;
  `,
  reader: css`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0f1420;
    overflow: hidden;
    border-radius: 0;
  `,
  header: css`
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-shrink: 0;
    position: sticky;
    top: 0;
    background: #0f1420;
    z-index: 10;
    @media (min-width: 768px) { padding: 20px 28px; }
  `,
  btn: css`
    background: rgba(255,255,255,0.1);
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    color: #e6eef8;
    cursor: pointer;
    font-size: 15px;
    &:hover { background: rgba(255,255,255,0.15); }
  `,
  readerTitle: css`
    margin: 12px 0 0;
    font-size: 20px;
    line-height: 1.3;
    @media (min-width: 768px) { font-size: 24px; }
  `,
  body: css`
    padding: 24px 20px;
    max-width: 800px;
    margin: 0 auto;
    font-size: 16px;
    line-height: 1.8;
    color: #d7e7fb;
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    h2 { font-size: 26px; color: #f6fbff; margin: 28px 0 16px; }
    h3 { font-size: 21px; color: #e6f2ff; margin: 20px 0 12px; }
    p { margin: 16px 0; }
    pre { padding: 10px 20px; }
    code:not(pre code) {
      background: rgba(255,255,255,0.05);
      padding: 3px 7px;
      border-radius: 5px;
      font-size: 0.9em;
      color: #a7d7ff;
    }
    @media (min-width: 768px) { padding: 32px 40px; font-size: 17px; }
  `,
  codeWrapper: css`
    position: relative;
    margin: 20px 0;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.05);
    background: #0d1117;
  `,
  codeHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  `,
  codeLang: css`
    font-size: 12px;
    color: rgba(230,240,255,0.6);
    text-transform: uppercase;
    font-weight: 600;
  `,
  copyBtn: css`
    background: rgba(255,255,255,0.05);
    border: none;
    padding: 7px 14px;
    border-radius: 6px;
    color: rgba(230,240,255,0.8);
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    &:hover { background: rgba(255,255,255,0.12); color: #fff; }
    &.copied { background: rgba(16,185,129,0.2); color: #10b981; }
  `,
  loading: css`
    padding: 40px 20px;
    color: rgba(230,240,255,0.7);
    text-align: center;
    font-size: 16px;
  `,
};

export default defineComponent({
  name: 'ArticleReader',
  props: {
    articles: {
      type: Array,
      default: () => defaultArticles,
    },
  },
  setup(props) {
    const selected = ref<string | null>(null);
    const selectedTags = ref<string[]>([]);
    const html = ref<string>('');
    const loading = ref(false);

    const allTags = computed(() => {
      const set = new Set<string>();
      props.articles.forEach((a: any) =>
        a.tags?.forEach((t: string) => set.add(t)),
      );
      return Array.from(set).sort();
    });

    const filtered = computed(() => {
      if (selectedTags.value.length === 0) return props.articles;
      return props.articles.filter((a: any) =>
        a.tags?.some((tag: string) => selectedTags.value.includes(tag)),
      );
    });

    const article = computed(() => {
      if (!selected.value) return null;
      return props.articles.find((a: any) => a.id === selected.value);
    });

    const openArticle = (id: string) => {
      selected.value = id;
    };

    const closeModal = () => {
      selected.value = null;
    };

    const toggleTag = (tag: string) => {
      selectedTags.value = selectedTags.value.includes(tag)
        ? selectedTags.value.filter((t) => t !== tag)
        : [...selectedTags.value, tag];
    };

    const clearFilters = () => {
      selectedTags.value = [];
    };

    watch(article, async (art) => {
      if (!art) {
        html.value = '';
        return;
      }
      loading.value = true;
      try {
        html.value = await processMarkdownWithShiki(art.content);
      } catch (err) {
        console.error('Failed to process markdown:', err);
        html.value = art.content;
      } finally {
        loading.value = false;
      }
    });

    const enhanceCodeBlocks = (el: HTMLElement | null) => {
      if (!el) return;

      el.querySelectorAll('pre').forEach((pre) => {
        const code = pre.querySelector('code');
        if (!code || pre.parentElement?.classList.contains(s.codeWrapper))
          return;

        const lang = code.getAttribute('data-lang') || 'text';
        const text = code.getAttribute('data-code') || code.textContent || '';

        const wrapper = document.createElement('div');
        wrapper.className = s.codeWrapper;

        const header = document.createElement('div');
        header.className = s.codeHeader;

        const langSpan = document.createElement('span');
        langSpan.className = s.codeLang;
        langSpan.textContent = lang;

        const copyBtn = document.createElement('button');
        copyBtn.className = s.copyBtn;
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        `;

        copyBtn.onclick = () => {
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Copied!
            `;
            copyBtn.classList.add('copied');
            setTimeout(() => {
              copyBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              `;
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        };

        header.appendChild(langSpan);
        header.appendChild(copyBtn);
        wrapper.appendChild(header);
        wrapper.appendChild(pre.cloneNode(true));

        pre.parentNode?.replaceChild(wrapper, pre);
      });
    };

    return () => (
      <div class={s.app}>
        <h1 class={s.title}>Articles</h1>

        <div class={s.tagsContainer}>
          {allTags.value.map((tag) => (
            <button
              key={tag}
              class={clsx(s.tag, selectedTags.value.includes(tag) && 'active')}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
          {selectedTags.value.length > 0 && (
            <button class={s.clearBtn} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        <div class={s.list}>
          <pre>{JSON.stringify(filtered.value, null, 2)}</pre>
          {filtered.value.map((item, idx) => (
            <div
              key={idx}
              class={s.card}
              onClick={() => {
                console.log(idx);
                openArticle(idx);
              }}
            >
              <h3 class={s.cardTitle}>{item.title}</h3>
              <div class={s.date}>{item.date}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {item.tags?.map((t: string) => (
                  <span key={t} style={{ marginRight: '8px' }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {article.value && (
          <div
            key={article.value.id}
            class={s.modal}
            onClick={(e: any) => e.target === e.currentTarget && closeModal()}
          >
            <div class={s.reader}>
              <div class={s.header}>
                <button class={s.btn} onClick={closeModal}>
                  ← Back
                </button>
                <h2 class={s.readerTitle}>{article.value.title}</h2>
                <div class={s.date}>{article.value.date}</div>
              </div>

              <div class={s.body}>
                {loading.value ? (
                  <div class={s.loading}>
                    Loading with syntax highlighting...
                  </div>
                ) : (
                  <div
                    ref={(el: HTMLElement | null) => {
                      if (el && html.value) {
                        el.innerHTML = html.value;
                        nextTick(() => enhanceCodeBlocks(el));
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
  },
});
