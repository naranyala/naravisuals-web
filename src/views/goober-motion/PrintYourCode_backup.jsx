import { defineComponent, ref, nextTick } from 'vue'
import { css } from 'goober'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'

// Dark theme color mapping (Prism Tomorrow Night inspired)
const darkThemeColors = {
    keyword: '#c792ea',
    string: '#ecc48d',
    comment: '#637777',
    function: '#82aaff',
    number: '#f78c6c',
    tag: '#7fdbca',
    'attr-name': '#addb67',
    'attr-value': '#ecc48d',
    punctuation: '#d9d9d9',
    operator: '#d9d9d9',
    default: '#d9d9d9'
}

const styles = {
    wrapper: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 24px;
    background: #1e1e1e; /* dark background */
    color: #d9d9d9;
    font-family: 'JetBrains Mono', monospace;
  `,
    textarea: css`
    width: 100%;
    max-width: 1080px;
    min-height: 160px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    line-height: 20px;
    padding: 12px;
    border: 1px solid #333;
    border-radius: 6px;
    background: #252526;
    color: #d9d9d9;
    resize: vertical;
  `,
    canvas: css`
    border: 1px solid #333;
    border-radius: 8px;
    background: #1e1e1e;
    width: 100%;
    max-width: 1080px;
  `,
    button: css`
    background: #4FD1C5;
    color: #0B0E14;
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    &:hover {
      background: #38B2AC;
    }
  `
}

export default defineComponent({
    name: 'PrismCodeBlock',
    setup() {
        const codeInput = ref('')
        const canvasRef = ref(null)

        const draw = () => {
            const canvas = canvasRef.value
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const pad = 16
            const lineHeight = 22
            const fontSize = 14
            const width = 1080

            // Prism highlight
            const highlighted = Prism.highlight(codeInput.value, Prism.languages.jsx, 'jsx')
            const lines = highlighted.split('\n')
            const height = lines.length * lineHeight + pad * 2

            canvas.width = width
            canvas.height = height

            // Dark background
            ctx.fillStyle = '#1e1e1e'
            ctx.fillRect(0, 0, width, height)

            ctx.font = `${fontSize}px JetBrains Mono, monospace`
            ctx.textBaseline = 'top'

            let y = pad
            for (const line of lines) {
                const tmp = document.createElement('div')
                tmp.innerHTML = line
                let x = pad
                for (const node of tmp.childNodes) {
                    let text = node.textContent || ''
                    let color = darkThemeColors.default
                    if (node.nodeType === 1) {
                        const cls = node.className || ''
                        for (const key in darkThemeColors) {
                            if (cls.includes(`token ${key}`)) {
                                color = darkThemeColors[key]
                                break
                            }
                        }
                    }
                    ctx.fillStyle = color
                    ctx.fillText(text, x, y)
                    x += ctx.measureText(text).width
                }
                y += lineHeight
            }
        }

        const snapshot = () => nextTick(() => draw())

        const download = () => {
            const canvas = canvasRef.value
            if (!canvas) return
            const a = document.createElement('a')
            a.href = canvas.toDataURL('image/png')
            a.download = 'code.png'
            a.click()
        }

        return () => (
            <div class={styles.wrapper}>
                <textarea
                    class={styles.textarea}
                    v-model={codeInput.value}
                    placeholder="Paste or type JSX/JS code here..."
                />
                <button class={styles.button} onClick={snapshot}>
                    Snapshot to Canvas
                </button>
                <canvas ref={canvasRef} class={styles.canvas}></canvas>
                <button class={styles.button} onClick={download}>
                    Save PNG
                </button>
            </div>
        )
    }
})

