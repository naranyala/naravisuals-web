// ArticleDraft.vue (in JSX)
import { defineComponent, ref, onMounted } from 'vue'
import { setup, css } from 'goober'
import { clsx } from 'clsx'
import { marked } from 'marked'
import { codeToHtml } from 'shiki'

// Setup Goober
setup(() => {})

const defaultContent = `# Getting Started with Markdown

This is a **bold** statement and this is *italic*.

## Code Examples

Here's some JavaScript:

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

And some Python:

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`

## Lists

- Item 1
- Item 2
- Item 3

1. First
2. Second
3. Third

## Links and Images

[Visit OpenAI](https://openai.com)

> This is a blockquote
> It can span multiple lines
`

// Define styles with Goober's css function
const styles = {
  app: css`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0a0e1a;
  `,
  toolbar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  `,
  toolbarLeft: css`
    display: flex;
    align-items: center;
  `,
  logo: css`
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: #f1f8ff;
  `,
  toolbarRight: css`
    display: flex;
    gap: 8px;
  `,
  modeBtn: css`
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 8px 16px;
    border-radius: 8px;
    color: rgba(230,240,255,0.8);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    font-family: inherit;

    &:hover {
      background: rgba(255,255,255,0.08);
    }
  `,
  modeBtnActive: css`
    background: rgba(100,180,255,0.15);
    border-color: rgba(100,180,255,0.3);
    color: #64b4ff;

    &:hover {
      background: rgba(100,180,255,0.2);
    }
  `,
  container: css`
    flex: 1;
    display: flex;
    overflow: hidden;
  `,
  editorPanel: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    border-right: 1px solid rgba(255,255,255,0.05);
    overflow: auto;
  `,
  previewPanel: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow: auto;
  `,
  metaInputs: css`
    margin-bottom: 16px;
  `,
  titleInput: css`
    width: 100%;
    padding: 12px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #e6f0ff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: rgba(100,180,255,0.3);
    }
  `,
  dateInput: css`
    width: 200px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: rgba(230,240,255,0.7);
    font-size: 14px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: rgba(100,180,255,0.3);
    }
  `,
  textarea: css`
    flex: 1;
    padding: 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 8px;
    color: #d7e7fb;
    font-size: 15px;
    line-height: 1.8;
    font-family: 'Fira Code', monospace;
    resize: none;

    &:focus {
      outline: none;
      border-color: rgba(100,180,255,0.3);
    }
  `,
  previewHeader: css`
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  `,
  previewTitle: css`
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px;
    color: #f6fbff;
  `,
  previewDate: css`
    font-size: 14px;
    color: rgba(230,240,255,0.6);
  `,
  previewContent: css`
    font-size: 16px;
    line-height: 1.8;
    color: #d7e7fb;

    & h1 {
      font-size: 28px;
      color: #f6fbff;
      margin: 24px 0 12px;
    }
    & h2 {
      font-size: 24px;
      color: #f6fbff;
      margin: 20px 0 12px;
    }
    & h3 {
      font-size: 20px;
      color: #f6fbff;
      margin: 16px 0 10px;
    }
    & p {
      margin: 12px 0;
    }
    & code:not(pre code) {
      background: rgba(255,255,255,0.05);
      padding: 3px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
      color: #a7d7ff;
    }
    & pre {
      margin: 16px 0;
      border-radius: 8px;
      overflow: auto;
      border: 1px solid rgba(255,255,255,0.05);
      background: #1a1f2e;
    }
    & pre code {
      display: block;
      padding: 14px;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.6;
      background: transparent;
    }
    & ul, & ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    & li {
      margin: 6px 0;
    }
    & blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      background: rgba(255,255,255,0.02);
      border-left: 3px solid rgba(100,180,255,0.4);
      color: rgba(230,240,255,0.8);
    }
    & a {
      color: #64b4ff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
    & strong {
      color: #f1f8ff;
      font-weight: 600;
    }
    & em {
      color: #e0f0ff;
      font-style: italic;
    }
  `
}


export default defineComponent({
  name: 'ArticleDraft',

  setup() {
    const mode = ref('editor') // 'editor' or 'preview'
    const title = ref('My Article')
    const date = ref(new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }))
    const content = ref(defaultContent)
    const htmlContent = ref('')

    // Configure marked with custom renderer for code highlighting
    const configureMarked = () => {
      const renderer = new marked.Renderer()

      renderer.code = async (code, language) => {
        if (!language) language = 'text'

        try {
          // Use shiki for syntax highlighting
          const highlighted = await codeToHtml(code, {
            lang: language,
            theme: 'vitesse-dark'
          })
          return highlighted
        } catch (error) {
          console.warn(`Failed to highlight ${language} code:`, error)
          // Fallback to plain code block
          return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
        }
      }

      // Customize other renderer methods if needed
      renderer.heading = (text, level) => {
        return `<h${level}>${text}</h${level}>`
      }

      return renderer
    }

    // Escape HTML entities
    const escapeHtml = (str) => {
      return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m]))
    }

    // Update HTML content when markdown changes
    const updateHtmlContent = async () => {
      const renderer = configureMarked()

      // We need to process code blocks separately since marked's renderer.code is not async-friendly
      // Let's parse and handle code blocks manually
      let html = await marked.parse(content.value, {
        renderer: new marked.Renderer(),
        breaks: true,
        gfm: true,
        smartLists: true,
        smartypants: true
      })

      // Process code blocks with shiki
      const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g
      const promises = []
      const matches = []

      html.replace(codeBlockRegex, (match, lang, code) => {
        matches.push({ match, lang, code })
        return match
      })

      for (const { match, lang, code } of matches) {
        try {
          const highlighted = await codeToHtml(code, {
            lang: lang || 'text',
            theme: 'vitesse-dark'
          })
          html = html.replace(match, highlighted)
        } catch (error) {
          console.warn(`Failed to highlight ${lang} code:`, error)
          // Keep the original
        }
      }

      htmlContent.value = html
    }

    // Watch content changes with debounce
    let updateTimeout = null
    const handleContentChange = (event) => {
      content.value = event.target.value

      // Debounce the update to prevent too many async calls
      if (updateTimeout) {
        clearTimeout(updateTimeout)
      }

      updateTimeout = setTimeout(() => {
        updateHtmlContent()
      }, 300)
    }

    // Initial update
    onMounted(() => {
      updateHtmlContent()
    })

    const handleTitleChange = (event) => {
      title.value = event.target.value
    }

    const handleDateChange = (event) => {
      date.value = event.target.value
    }

    const setMode = (newMode) => {
      mode.value = newMode
    }

    return () => (
      <div class={styles.app}>
        <div class={styles.toolbar}>
          <div class={styles.toolbarLeft}>
            <h1 class={styles.logo}>Article Maker</h1>
          </div>
          <div class={styles.toolbarRight}>
            <button
              class={clsx(styles.modeBtn, mode.value === 'editor' && styles.modeBtnActive)}
              onClick={() => setMode('editor')}
            >
              ✏️ Editor
            </button>
            <button
              class={clsx(styles.modeBtn, mode.value === 'preview' && styles.modeBtnActive)}
              onClick={() => setMode('preview')}
            >
              👁️ Preview
            </button>
          </div>
        </div>

        <div class={styles.container}>
          {mode.value === 'editor' && (
            <div class={styles.editorPanel}>
              <div class={styles.metaInputs}>
                <input
                  type="text"
                  value={title.value}
                  onInput={handleTitleChange}
                  placeholder="Article Title"
                  class={styles.titleInput}
                />
                <input
                  type="text"
                  value={date.value}
                  onInput={handleDateChange}
                  placeholder="Date"
                  class={styles.dateInput}
                />
              </div>
              <textarea
                value={content.value}
                onInput={handleContentChange}
                placeholder="Write your article in Markdown..."
                class={styles.textarea}
                spellcheck={false}
                rows={20}
              />
            </div>
          )}

          {mode.value === 'preview' && (
            <div class={styles.previewPanel}>
              <div class={styles.previewHeader}>
                <h1 class={styles.previewTitle}>{title.value}</h1>
                <div class={styles.previewDate}>{date.value}</div>
              </div>
              <div
                class={styles.previewContent}
                innerHTML={htmlContent.value}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
})
