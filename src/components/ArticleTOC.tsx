
import { css, setup } from 'goober';
import clsx from 'clsx';

setup(); // Initialize goober


export default {
  props: {
    htmlContent: {
      type: String,
      required: true,
    },
  },
  methods: {
    // Extract headings from raw HTML
    extractHeadings(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headings).map((heading) => ({
        text: heading.textContent,
        level: parseInt(heading.tagName.substring(1), 10),
        id: heading.id || this.generateId(heading.textContent),
      }));
    },
    // Generate an ID for headings without one
    generateId(text) {
      return text.toLowerCase().replace(/\s+/g, '-');
    },
  },
  render() {
    const headings = this.extractHeadings(this.htmlContent);

    return (
      <div class={clsx(styles.tocContainer)}>
        <h3 class={clsx(styles.tocTitle)}>Table of Contents</h3>
        <ul class={clsx(styles.tocList)}>
          {headings.map((heading, index) => (
            <li
              key={index}
              class={clsx(
                styles.tocItem,
                heading.level > 1 && styles.tocSubItem
              )}
            >
              <a
                href={`#${heading.id}`}
                class={clsx(styles.tocLink)}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  },
};


const styles = {
  tocContainer: css`
    background-color: #1e1e1e;
    color: #e0e0e0;
    padding-top: 40px;
    padding-left: 3rem;
    padding-bottom: 3rem;
    border-radius: 10px;
    margin: 1rem 0;
    max-width: 100%;
  `,
  tocTitle: css`
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    border-bottom: 1px solid #444;
    padding-bottom: 0.5rem;
  `,
  tocList: css`
    list-style: none;
    padding: 0;
    margin: 0;
  `,
  tocItem: css`
    margin-bottom: 0.5rem;
    padding-left: 0rem;
  `,
  tocLink: css`
    color: #bb86fc;
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s ease;

    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  `,
  tocSubItem: css`
    padding-left: 1.5rem;
  `,
};
