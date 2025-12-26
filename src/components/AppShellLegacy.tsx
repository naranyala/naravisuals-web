// FullArticles.jsx
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { css } from 'goober'
import clsx from "clsx"

import ArticleTOC from "./ArticleTOC.jsx"
import ArticleReferences from "./ArticleReferences.jsx"
// import HtmlRendererWrapper from "./HtmlRendererWrapper.jsx"


export default defineComponent({
  name: 'FullArticles',
  props: { articles: Array },
  setup(props) {
    const router = useRouter()
    const articles = ref(props.articles || [])
    const current = ref(null)

    const showArticle = (slug) => {
      current.value = articles.value.find(a => a.slug === slug)
      router.push({ query: { article: slug } })
    }

    const goBack = () => {
      current.value = null
      router.push('/articles')
    }

    onMounted(() => {
    })

    return () => (
      <div class={clsx(styles.app, styles.root)}>
        {current.value ? (
          // Article reader view
          <div>
            <header class={styles.header}>
              <button class={styles.backBtn} onClick={goBack}>
                ← Back to all articles
              </button>
            </header>

            <main class={styles.readerContainer}>
              <h1 class={styles.readerTitle}>{current.value.title}</h1>


              <div class={styles.readerMeta}>
                <time>{current.value.date}</time>
              </div>

  <ArticleTOC htmlContent={current.value.content}/>




          <pre>{JSON.stringify(current.value.content, null, 2)}</pre>

          {/*

          <HtmlRendererWrapper class={styles.readerContent} content={current.value.content}/>
          <div class={styles.readerContent} v-html={current.value.content}></div>
            */}


            </main>

<ArticleReferences references={current.value.references}/>

          </div>
        ) : (
          // Articles list view
          <div class={styles.listContainer}>
            <header class={styles.header}>
              <h1 class={styles.listTitle}>Articles</h1>
            </header>

            {articles.value.map(article => (
              <article
                key={article.id}
                class={styles.articleCard}
                onClick={() => showArticle(article.slug)}
              >
                <h2 class={styles.cardTitle}>{article.title}</h2>
                <p class={styles.cardExcerpt}>{article.excerpt}</p>
                <div class={styles.cardMeta}>
                  <time>{article.date}</time>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    )
  }
})


const styles = {
  // Global container for both views
  app: css`
    min-height: 100vh;
    background: #0d0d0f;
    color: #e5e5e5;
    font-family: system-ui, -apple-system, BlinkMacOSystem, 'Segoe UI', Roboto, sans-serif;
  `,

  // Shared header / back button style
  header: css`
    padding: 2rem 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  `,

  backBtn: css`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 0.6rem;
    color: #a0a0a8;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255,255,255,0.12);
      color: #ffffff;
      transform: translateX(-3px);
    }
  `,

  // List view
  listContainer: css`
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1.5rem 4rem;
  `,

  listTitle: css`
    font-size: 2.8rem;
    font-weight: 700;
    text-align: center;
    margin: 1rem 0 3.5rem;
    background: linear-gradient(90deg, #a78bfa, #7dd3fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,

  articleCard: css`
    padding: 1.8rem;
    margin-bottom: 1.25rem;
    background: #17171b;
    border-radius: 1rem;
    border: 1px solid rgba(255,255,255,0.06);
    transition: all 0.25s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      background: #1f1f25;
      box-shadow: 0 20px 35px -15px rgba(0,0,0,0.5);
    }
  `,

  cardTitle: css`
    margin: 0 0 0.8rem;
    font-size: 1.65rem;
    color: #f1f1f1;
  `,

  cardExcerpt: css`
    margin: 0 0 1rem;
    color: #a0a0a8;
    line-height: 1.55;
  `,

  cardMeta: css`
    color: #6b7280;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `,

  // Article reader view
  readerContainer: css`
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem 6rem;
  `,

  readerTitle: css`
    font-size: 3.2rem;
    line-height: 1.15;
    margin: 0 0 1.2rem;
    font-weight: 700;
    color: #ffffff;
  `,

  readerMeta: css`
    color: #6b7280;
    font-size: 1rem;
    margin-bottom: 2.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  `,

  readerExcerpt: css`
    font-size: 1.3rem;
    line-height: 1.6;
    color: #a0a0a8;
    margin: 0 0 3rem;
    font-style: italic;
    border-left: 4px solid #6b7280;
    padding-left: 1.2rem;
  `,

  readerContent: css`
    font-size: 1.15rem;
    line-height: 1.75;
    color: #d1d5db;
    padding-bottom: 100px;
    border-bottom: 1px solid gray;

    p {
      margin-bottom: 1.6rem;
    }

    h2, h3 {
      color: #ffffff;
      margin: 2.5rem 0 1.2rem;
    }

    strong {
      color: #f3f4f6;
    }

  `,
  root: css`
    pre {
      margin: 2rem 0;
      border-radius: 0.8rem;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.45);
      border: 1px solid gray;
      border-radius: 10px;
      padding: 20px;
    }

    code[class*="language-"] {
      font-family: 'Fira Code', 'SF Mono', Consolas, 'Courier New', monospace;
      font-size: 0.96rem;
    }

  `
}
