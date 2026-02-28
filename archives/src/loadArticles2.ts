import matter from 'gray-matter';
import { marked } from 'marked';
import { onMounted, reactive, ref } from 'vue';
import { z } from 'zod';

const ReferenceSchema = z.object({
  authors: z.string(),
  title: z.string(),
  journal: z.string(),
  year: z.string().regex(/^\d{4}$/),
});

const ArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  date: z.string().regex(/^\w+ \d{1,2}, \d{4}$/), // e.g., "December 15, 2025"
  content: z.string(), // HTML after parsing
  references: z.array(ReferenceSchema).optional().default([]),
});

function parseMarkdownArticle(rawMarkdown, sourcePath) {
  console.log('raw: ', rawMarkdown);

  const { data: frontmatter, content: markdownBody } = matter(rawMarkdown);

  const htmlContent = marked.parse(markdownBody, {
    gfm: true,
    breaks: true,
  });

  const rawArticle = {
    ...frontmatter,
    content: htmlContent,
  };

  // return rawArticle;

  try {
    return ArticleSchema.parse(rawArticle);
  } catch (err) {
    // throw error;
    console.error(err);
  }
}

const markdownModules = import.meta.glob('./articles/**/*.md', {
  query: '?raw',
  eager: true,
});

// console.log("modules: ", markdownModules)

async function loadArticles() {
  const articles = [];

  for (const [path, rawMarkdown] of Object.entries(markdownModules)) {
    try {
      const article = parseMarkdownArticle(rawMarkdown.default, path);
      // console.log("temp: ", articles)
      articles.push(article);
    } catch (err) {
      console.error(err);
    }
  }

  // console.log(articles)
  return articles.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export { loadArticles };
