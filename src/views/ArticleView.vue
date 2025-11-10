<script setup>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';

// ===== State =====
const markdownFiles = ref([]);
const selectedFile = ref(null);
const loading = ref(true);
const error = ref(null);
const isParentTitleVisible = ref(false)

// ===== Constants =====
const SEPARATOR_LENGTH = 60;
const ARTICLE_PREFIXES = ['00-', '01-', '02-'];

// ===== Computed =====
const groupedArticles = computed(() => {
  return ARTICLE_PREFIXES.map(prefix => ({
    prefix,
    files: markdownFiles.value.filter(file => file.name.startsWith(prefix))
  })).filter(group => group.files.length > 0);
});

// ===== Lifecycle =====
onMounted(async () => {
  await loadMarkdownFiles();
});

// ===== Methods =====
async function loadMarkdownFiles() {
  try {
    loading.value = true;
    error.value = null;

    const modules = import.meta.glob('../articles/*.md', { as: 'raw', eager: false });
    
    const promises = Object.keys(modules).map(async (path) => {
      const markdown = await modules[path]();
      const name = path.split('/').pop();
      
      return {
        name,
        path,
        content: marked(markdown),
        title: formatArticleTitle(name)
      };
    });

    markdownFiles.value = await Promise.all(promises);
  } catch (err) {
    console.error('Failed to load markdown files:', err);
    error.value = 'Failed to load articles. Please try again later.';
  } finally {
    loading.value = false;
  }
}

function formatArticleTitle(filename) {
  // Remove .md extension and split by hyphen
  const parts = filename.replace('.md', '').split('-');
  
  // Extract numbering (first 2 parts) and readable text
  const numbering = parts.slice(0, 2).join('-');
  const readablePart = parts.slice(2).join(' ');
  
  // Capitalize each word
  const formattedText = readablePart
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `${numbering} ${formattedText}`;
}

function selectFile(file) {
  isParentTitleVisible.value = false;
  selectedFile.value = file;
  
  // Scroll to top when article is selected
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deselectFile() {
  isParentTitleVisible.value = true;
  selectedFile.value = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <div class="markdown-viewer">
    <!-- Header (hidden in print when viewing article) -->
    <header v-if="isParentTitleVisible" class="viewer-header" :class="{ 'print-hide': selectedFile }">
      <h1>Articles</h1>
    </header>



    <!-- Loading State -->
    <div v-if="loading" class="status-message">
      <p>Loading articles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="status-message error">
      <p>{{ error }}</p>
    </div>

    <!-- Article List View -->
    <nav v-else-if="!selectedFile" class="article-list no-print" aria-label="Article navigation">
      <template v-if="markdownFiles.length">
        <div 
          v-for="(group, index) in groupedArticles" 
          :key="group.prefix"
          class="article-group"
        >
          <ul>
            <li v-for="file in group.files" :key="file.path">
              <a 
                href="#" 
                class="article-link"
                @click.prevent="selectFile(file)"
                :aria-label="`Read article: ${file.title}`"
              >
                {{ file.title }}
              </a>
            </li>
          </ul>
          
          <!-- Separator between groups (not after last group) -->
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
    <article v-if="selectedFile" class="article-detail">
      <!-- <header class="article-header"> -->
      <!--   <h2 class="article-title">{{ selectedFile.title }}</h2> -->
      <!--   <p class="article-filename">{{ selectedFile.name }}</p> -->
      <!-- </header> -->
        <button 
          @click="deselectFile" 
          aria-label="Return to article list"
        >
          ← Back to Articles
        </button>


      <div 
        v-html="selectedFile.content" 
        class="markdown-content"
      ></div>

      <footer class="article-footer no-print">
        <button 
          @click="deselectFile" 
          aria-label="Return to article list"
        >
          ← Back to Articles
        </button>
      </footer>
    </article>
  </div>
</template>

<style scoped>
/* ===== Base Styles ===== */
.markdown-viewer {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* ===== Header ===== */
.viewer-header h1 {
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
}

/* ===== Status Messages ===== */
.status-message {
  padding: 2rem;
  text-align: center;
  color: #ccc;
}

.status-message.error {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
}

.status-message code {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

/* ===== Article List ===== */
.article-list {
  margin-top: 1rem;
}

.article-group {
  margin-bottom: 1.5rem;
}

.article-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-group li {
  margin: 0.75rem 0;
}

.article-link {
  display: inline-block;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  font-family: 'Courier New', Courier, monospace;
  transition: all 0.2s ease;
  padding: 0.25rem 0;
}

.article-link:hover {
  color: #4a9eff;
  text-decoration: underline;
  transform: translateX(4px);
}

.article-link:focus {
  outline: 2px solid #4a9eff;
  outline-offset: 4px;
  border-radius: 2px;
}

.separator {
  margin: 1.5rem 0;
  color: #555;
  font-size: 0.9rem;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Article Detail ===== */
.article-detail {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.article-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.article-filename {
  margin: 0;
  font-size: 0.9rem;
  color: #888;
  font-family: 'Courier New', monospace;
}

.markdown-content {
  line-height: 1.8;
  color: #e0e0e0;
  padding: 1rem 0;
  font-size: 1.05rem;
}

/* Improve markdown content readability */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #fff;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin-bottom: 1.2rem;
}

.markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1.2rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #4a9eff;
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #bbb;
  font-style: italic;
}

.markdown-content :deep(a) {
  color: #4a9eff;
  text-decoration: underline;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1.5rem 0;
}

/* ===== Article Footer ===== */
.article-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
}


/* ===== Print Styles ===== */
@media print {
  /* Hide elements that shouldn't print */
  .no-print,
  .print-hide {
    display: none !important;
  }

  /* Reset print layout */
  .markdown-viewer {
    max-width: 100%;
    margin: 0;
    padding: 0;
    color: #000;
  }

  .article-detail {
    animation: none;
  }

  .article-header {
    border-bottom: 2px solid #000;
    margin-bottom: 1.5rem;
    page-break-after: avoid;
  }

  .article-title {
    color: #000;
    font-size: 24pt;
  }

  .article-filename {
    color: #666;
  }

  .markdown-content {
    color: #000;
    font-size: 11pt;
    line-height: 1.6;
  }

  /* Print-specific markdown styles */
  .markdown-content :deep(h1),
  .markdown-content :deep(h2),
  .markdown-content :deep(h3) {
    color: #000;
    page-break-after: avoid;
  }

  .markdown-content :deep(h1) {
    font-size: 20pt;
  }

  .markdown-content :deep(h2) {
    font-size: 16pt;
  }

  .markdown-content :deep(h3) {
    font-size: 14pt;
  }

  .markdown-content :deep(code) {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    color: #000;
  }

  .markdown-content :deep(pre) {
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    page-break-inside: avoid;
  }

  .markdown-content :deep(blockquote) {
    border-left: 4px solid #666;
    color: #333;
    page-break-inside: avoid;
  }

  .markdown-content :deep(a) {
    color: #000;
    text-decoration: underline;
  }

  /* Show URLs after links in print */
  .markdown-content :deep(a[href^="http"])::after {
    content: " (" attr(href) ")";
    font-size: 9pt;
    color: #666;
  }

  .markdown-content :deep(img) {
    page-break-inside: avoid;
  }

  /* Avoid page breaks in lists */
  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    page-break-inside: avoid;
  }
}

/* ===== Responsive Design ===== */
@media (max-width: 768px) {
  .markdown-viewer {
    padding: 0 1rem;
    margin: 1rem auto;
  }

  .viewer-header h1 {
    font-size: 2rem;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-link {
    font-size: 1rem;
  }

  .separator {
    font-size: 0.8rem;
  }
}
</style>
