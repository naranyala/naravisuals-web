// CodeBlockRenderer.tsx
import { defineComponent, onMounted, onUpdated, ref, watch, nextTick } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';
import { createHighlighter } from 'shiki';


// Cache highlighter instance
let highlighterPromise = null;

const getShikiHighlighter = async () => {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: [
      'javascript',
      'typescript',
      'tsx',
      'jsx',
      'json',
      'css',
      'bash',
      'html',
      'markdown',
      'diff',
      'c',
      'cpp',
      'go',
      'rust',
      'python',
      'sql',
      'yaml',
    ],
  });

  return highlighterPromise;
};

export default defineComponent({
  name: 'CodeBlockRenderer',

  props: {
    rawHtml: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const container = ref(null);

    const highlightWithShiki = async () => {
      if (!container.value) return;

      const highlighter = await getShikiHighlighter();

      const pres = container.value.querySelectorAll('pre:not([data-highlighted])');

      for (const pre of pres) {
        const codeBlock = pre.querySelector('code');
        if (!codeBlock) continue;

        const langClass = [...codeBlock.classList].find((cls) => cls.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'text';

        try {
          const code = codeBlock.textContent || '';
          const html = highlighter.codeToHtml(code, {
            lang,
            theme: 'github-dark',
          });

          // Replace the entire pre block with Shiki's output
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const newPre = tempDiv.querySelector('pre');

          if (newPre) {
            // Copy over any existing classes
            newPre.className = pre.className;
            pre.replaceWith(newPre);
            newPre.setAttribute('data-highlighted', 'true');
            newPre.setAttribute('data-lang', lang);
          }
        } catch (e) {
          console.warn(`Shiki failed for language: ${lang}`, e);
          // Mark as processed even on failure
          pre.setAttribute('data-highlighted', 'true');
        }
      }
    };

    const addCopyButtons = () => {
      if (!container.value) return;

      // Clean up old buttons
      container.value.querySelectorAll('.shiki-copy-btn').forEach((el) => el.remove());

      const pres = container.value.querySelectorAll('pre');
      pres.forEach((pre) => {
        const btn = document.createElement('button');
        btn.className = clsx('shiki-copy-btn', styles.copyButton);
        btn.type = 'button';
        btn.textContent = 'Copy';

        btn.onclick = async () => {
          const codeElement = pre.querySelector('code');
          const code = codeElement?.textContent;

          if (!code) return;

          try {
            await navigator.clipboard.writeText(code);
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add(styles.copySuccess);

            setTimeout(() => {
              btn.textContent = original || 'Copy';
              btn.classList.remove(styles.copySuccess);
            }, 1800);
          } catch (err) {
            console.error('Copy failed', err);
            btn.textContent = 'Failed';
            setTimeout(() => (btn.textContent = 'Copy'), 1800);
          }
        };

        pre.style.position = 'relative';
        pre.appendChild(btn);
      });
    };

    const update = async () => {
      await nextTick();
      await highlightWithShiki();
      addCopyButtons();
    };

    onMounted(update);
    onUpdated(update);

    watch(
      () => props.rawHtml,
      () => nextTick(update),
      { immediate: true }
    );

    return {container}

  },
  render(props){
    const {container}  = this

    return (
      <div
        ref={container}
        class={clsx('shiki-renderer', styles.wrapper)}
        innerHTML={props.rawHtml}
      />
    )
  }
});


const styles = {
  wrapper: css`
    position: relative;
  `,

  pre: css`
    position: relative;
    margin: 1.5rem 0;
    border-radius: 8px;
    overflow: hidden;
    background: #0d1117;
  `,

  copyButton: css`
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 10;

    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    color: #c9d1d9;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(240, 246, 252, 0.12);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.13s ease;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

    &:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #e6edf3;
    }

    &:active {
      transform: scale(0.97);
    }
  `,

  copySuccess: css`
    background: #238636 !important;
    color: white !important;
    border-color: #2ea043 !important;
  `,
};
