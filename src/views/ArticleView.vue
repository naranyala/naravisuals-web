<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import ArticleTOC from "./reusables/ArticleTOC.vue";
import { 
  setQueryParams, getQueryParams 
} from "./utils.js";

// ===== Configure marked =====
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
});

// ===== State =====
const articles = ref([]);
const selectedArticle = ref(null);
const isParentTitleVisible = ref(true);

// ===== Constants =====
const SEPARATOR_LENGTH = 60;
const ARTICLE_PREFIXES = ['00-', '01-', '02-'];

// ===== Computed =====
const groupedArticles = computed(() => {
  return ARTICLE_PREFIXES.map(prefix => ({
    prefix,
    articles: articles.value.filter(article => 
      article.name.startsWith(prefix) && !article.error
    )
  })).filter(group => group.articles.length > 0);
});

const isLoading = computed(() => 
  articles.value.some(a => a.loading)
);

const hasError = computed(() => 
  articles.value.length > 0 && articles.value.every(a => a.error)
);

const currentArticle = computed(() => selectedArticle.value);

// ===== Methods =====
async function loadMarkdownFiles() {
  try {
    const modules = import.meta.glob('../articles/*.md', { as: 'raw', eager: false });
    const paths = Object.keys(modules);

    if (paths.length === 0) {
      console.warn('No markdown files found in ../articles/');
      return;
    }

    // Initialize articles with loading state
    articles.value = paths.map(path => {
      const name = path.split('/').pop();
      return {
        name,
        path,
        slug: slugify(formatArticleTitle(name)),
        raw: '',
        html: '',
        title: formatArticleTitle(name),
        loading: true,
        error: false
      };
    });

    // Load all articles in parallel
    await Promise.all(paths.map(async (path, index) => {
      try {
        const markdown = await modules[path]();
        const rawHtml = marked.parse(markdown);
        
        // Sanitize HTML to prevent XSS
        articles.value[index].html = DOMPurify.sanitize(rawHtml, {
          ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 
                         'li', 'code', 'pre', 'blockquote', 'strong', 'em', 'img', 
                         'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
        });
        articles.value[index].raw = markdown;
        articles.value[index].loading = false;
      } catch (err) {
        console.error(`Failed to load ${path}:`, err);
        articles.value[index].error = true;
        articles.value[index].loading = false;
        articles.value[index].html = `<div class="error">
          <strong>Failed to load article</strong>
          <p>${err.message}</p>
        </div>`;
      }
    }));
  } catch (err) {
    console.error('Failed to load markdown files:', err);
  }
}

function formatArticleTitle(filename) {
  const parts = filename.replace('.md', '').split('-');
  const numbering = parts.slice(0, 2).join('-');
  const readablePart = parts.slice(2).join(' ');
  
  const formattedText = readablePart
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `${numbering} ${formattedText}`;
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function selectArticle(article) {
  if (article.loading || article.error) return;
  
  isParentTitleVisible.value = false;
  selectedArticle.value = article;
  
  setQueryParams({ 
    page: "article", 
    articleId: article.slug 
  }, true);
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deselectArticle() {
  isParentTitleVisible.value = true;
  selectedArticle.value = null;
  
  setQueryParams({ page: "articles" }, true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restoreArticleFromUrl() {
  const params = getQueryParams();
  
  if (params.page === 'article' && params.articleId) {
    const article = articles.value.find(a => a.slug === params.articleId);
    if (article && !article.loading && !article.error) {
      selectedArticle.value = article;
      isParentTitleVisible.value = false;
    }
  }
}

// ===== Lifecycle =====
onMounted(async () => {
  await loadMarkdownFiles();
  
  // Restore article from URL after loading
  if (articles.value.length > 0) {
    restoreArticleFromUrl();
  }
});

// Watch for articles finishing loading to restore URL state
watch(
  () => articles.value.every(a => !a.loading),
  (allLoaded) => {
    if (allLoaded && !selectedArticle.value) {
      restoreArticleFromUrl();
    }
  }
);
</script>

<template>
  <div class="markdown-viewer">
    <!-- Header -->
    <header 
      v-if="isParentTitleVisible" 
      class="viewer-header" 
      :class="{ 'print-hide': selectedArticle }"
    >
      <h1>Articles</h1>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading && articles.length === 0" class="status-message">
      <div class="loading-spinner"></div>
      <p>Loading articles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="status-message error">
      <p>Failed to load articles. Please try again later.</p>
    </div>

    <!-- Article List View -->
    <nav 
      v-else-if="!selectedArticle" 
      class="article-list no-print" 
      aria-label="Article navigation"
    >
      <template v-if="articles.length > 0">
        <div 
          v-for="(group, index) in groupedArticles" 
          :key="group.prefix"
          class="article-group"
        >
          <ul>
            <li v-for="article in group.articles" :key="article.path">
              <a 
                href="#" 
                class="article-link"
                :class="{ 
                  loading: article.loading,
                  error: article.error 
                }"
                @click.prevent="selectArticle(article)"
                :aria-label="`Read article: ${article.title}`"
                :aria-disabled="article.loading || article.error"
              >
                <span class="article-title-text">{{ article.title }}</span>
                <span v-if="article.loading" class="spinner"></span>
                <span v-if="article.error" class="error-icon">⚠</span>
              </a>
            </li>
          </ul>
          
          <!-- Separator between groups -->
          <div 
            v-if="index < groupedArticles.length - 1" 
            class="separator" 
            aria-hidden="true"
          >
            {{ "—".repeat(SEPARATOR_LENGTH) }}
          </div>
        </div>
      </template>

      <p v-else class="status-message">
        No markdown files found in <code>../articles/</code>
      </p>
    </nav>

    <!-- Article Detail View -->
    <article v-if="currentArticle" class="article-detail">
      <nav class="article-nav no-print">
      </nav>


        <button 
          @click="deselectArticle"
        class="no-print"
          aria-label="Return to article list"
        >
          ← Back to Articles
        </button>

      <header class="article-header">
        <h2 class="article-title">{{ currentArticle.title }}</h2>
      </header>

      <ArticleTOC v-if="currentArticle.raw" :markdown="currentArticle.raw" />

      <div v-if="currentArticle.loading" class="article-loading">
        <div class="loading-spinner"></div>
        <p>Loading article content...</p>
      </div>

      <div 
        v-else
        v-html="currentArticle.html" 
        class="markdown-content"
      ></div>


        <button 
          @click="deselectArticle"
        class="no-print"
          aria-label="Return to article list"
        >
          ← Back to Articles
        </button>

      <footer class="article-footer no-print">
      </footer>
    </article>
  </div>
</template>

<style scoped>
/* ===== Base Styles ===== */
.markdown-viewer {
  min-height: 100vh;
  background: #0f0f0f;
  color: #e0e0e0;
  padding: 40px 20px;
}

/* ===== Header ===== */
.viewer-header {
  max-width: 900px;
  margin: 0 auto 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
}

.viewer-header h1 {
  font-size: 42px;
  color: #fff;
  margin: 0;
  font-weight: 700;
}

/* ===== Status Messages ===== */
.status-message {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.status-message.error {
  color: #ff6b6b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== Article List ===== */
.article-list {
  max-width: 900px;
  margin: 0 auto;
}

.article-group {
  margin-bottom: 30px;
}

.article-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-group li {
  margin-bottom: 12px;
}

.article-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #1a1a1a;
  color: #e0e0e0;
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  transition: all 0.2s ease;
  font-size: 16px;
}

.article-link:hover:not(.loading):not(.error) {
  background: #252525;
  border-color: #4a9eff;
  transform: translateX(4px);
}

.article-link.loading {
  opacity: 0.6;
  cursor: wait;
  pointer-events: none;
}

.article-link.error {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ff6b6b;
}

.article-title-text {
  flex: 1;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #333;
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-left: 12px;
}

.error-icon {
  color: #ff6b6b;
  font-size: 18px;
  margin-left: 12px;
}

.separator {
  text-align: center;
  color: #333;
  margin: 24px 0;
  font-family: monospace;
  letter-spacing: 2px;
  user-select: none;
}

/* ===== Article Detail ===== */
.article-detail {
  max-width: 900px;
  margin: 0 auto;
}

.article-nav {
  margin-bottom: 30px;
}

/* .back-button { */
/*   padding: 12px 24px; */
/*   background: #1a1a1a; */
/*   color: #4a9eff; */
/*   border: 1px solid #2a2a2a; */
/*   border-radius: 6px; */
/*   font-size: 14px; */
/*   cursor: pointer; */
/*   transition: all 0.2s; */
/* } */
/**/
/* .back-button:hover { */
/*   background: #252525; */
/*   border-color: #4a9eff; */
/* } */

.article-header {
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
}

.article-title {
  font-size: 36px;
  color: #fff;
  margin: 0;
  font-weight: 700;
}

.article-loading {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

/* ===== Markdown Content ===== */
.markdown-content {
  line-height: 1.7;
  color: #e0e0e0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  margin-top: 32px;
  margin-bottom: 16px;
  color: #fff;
  font-weight: 600;
  text-align: left;
}

.markdown-content :deep(h1) { font-size: 32px; }
.markdown-content :deep(h2) { font-size: 26px; }
.markdown-content :deep(h3) { font-size: 22px; }
.markdown-content :deep(h4) { font-size: 18px; }

p {
  text-align: justify;
}

.markdown-content :deep(p) {
  margin-bottom: 16px;
  line-height: 1.8;
  text-align: justify;
}

.markdown-content :deep(code) {
  background: #1a1a1a;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
  color: #4a9eff;
  font-family: 'Courier New', monospace;
  border: 1px solid #2a2a2a;
}

.markdown-content :deep(pre) {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
  border: 1px solid #2a2a2a;
}

.markdown-content :deep(pre code) {
  padding: 0;
  background: none;
  border: none;
  color: #e0e0e0;
}

.markdown-content :deep(a) {
  color: #4a9eff;
  text-decoration: none;
  transition: color 0.2s;
  border-bottom: 1px solid transparent;
}

.markdown-content :deep(a:hover) {
  color: #6bb0ff;
  border-bottom-color: #6bb0ff;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 24px;
  margin-bottom: 16px;
}

.markdown-content :deep(li) {
  margin-bottom: 8px;
  line-height: 1.7;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #4a9eff;
  padding-left: 20px;
  margin: 20px 0;
  color: #999;
  font-style: italic;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 24px 0;
  border: 1px solid #2a2a2a;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 12px;
  border: 1px solid #2a2a2a;
  text-align: left;
}

.markdown-content :deep(th) {
  background: #1a1a1a;
  color: #fff;
  font-weight: 600;
}

.markdown-content :deep(tr:nth-child(even)) {
  background: #151515;
}

.markdown-content :deep(.error) {
  color: #ff6b6b;
  background: #2a1a1a;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #ff6b6b;
  margin: 20px 0;
}

.markdown-content :deep(.error strong) {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

/* ===== Footer ===== */
.article-footer {
  margin-top: 60px;
  padding-top: 30px;
  border-top: 1px solid #333;
}

/* ===== Print Styles ===== */
@media print {
  .no-print,
  .print-hide {
    display: none !important;
  }
  
  .markdown-viewer {
    background: white;
    color: black;
  }
  
  .article-title {
    color: black;
  }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .markdown-viewer {
    padding: 20px 16px;
  }
  
  .viewer-header h1 {
    font-size: 32px;
  }
  
  .article-title {
    font-size: 28px;
  }
  
  .separator {
    font-size: 12px;
  }
}
</style>
