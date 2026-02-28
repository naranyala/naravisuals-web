// src/components/ArticleReaderContent.jsx

import { css } from 'goober';
import Prism from 'prismjs';
import { defineComponent, onMounted } from 'vue';
import 'prismjs/themes/prism-okaidia.css'; // Dark theme (very popular)
import 'prismjs/components/prism-jsx'; // JSX support
import 'prismjs/components/prism-javascript'; // JS (already included, but explicit)
import 'prismjs/components/prism-markup'; // HTML
// Add more languages if needed: bash, css, json, tsx, etc.
// import 'prismjs/components/prism-typescript'

const styles = {
  root: css`
    font-size: 1.15rem;
    line-height: 1.75;
    color: #d1d5db;

    p {
      margin-bottom: 1.6rem;
    }

    h2, h3 {
      color: #ffffff;
      margin: 2.8rem 0 1.3rem;
      font-weight: 600;
    }

    strong {
      color: #f3f4f6;
    }

    /* Make sure Prism styles play nicely with our container */
    pre {
      margin: 2rem 0;
      border-radius: 0.8rem;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.45);
    }

    code[class*="language-"] {
      font-family: 'Fira Code', 'SF Mono', Consolas, 'Courier New', monospace;
      font-size: 0.96rem;
    }
  `,
};

export default defineComponent({
  name: 'ArticleReaderContent',

  props: {
    content: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    // Highlight code blocks after content is rendered
    onMounted(() => {
      // Prism will automatically highlight all <code> inside <pre>
      Prism.highlightAll();
    });

    return () => (
      <div
        class={styles.root}
        // Render the raw HTML (with <pre><code class="language-xxx">...</code></pre>)
        innerHTML={props.content}
      />
    );
  },
});
