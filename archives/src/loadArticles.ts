import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

const ReferenceSchema = z.object({
  writer: z.string(),
  title: z.string(),
  source: z.string(),
  year: z.string().regex(/^\d{4}$/),
});

const ArticleSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\w+ \d{1,2}, \d{4}$/),
  tags: z.array(z.string()),
  content: z.string(),
  // references: z.array(ReferenceSchema).optional().default([]),
});

function parseMarkdownArticle(rawMarkdown: string, sourcePath: string) {
  const { data: frontmatter, content: markdownBody } = matter(rawMarkdown);

  const htmlContent = marked.parse(markdownBody, {
    gfm: true,
    breaks: true,
  }) as string;

  const rawArticle = {
    ...frontmatter,
    content: htmlContent,
  };

  try {
    return ArticleSchema.parse(rawArticle);
  } catch (err) {
    console.error(`Validation error in ${sourcePath}:`, err);
    throw err;
  }
}

async function loadArticles() {
  const markdownFiles = import.meta.glob('./articles/**/*.md', {
    query: '?raw',
  });

  const articlePromises = Object.entries(markdownFiles).map(
    async ([path, importFn]) => {
      try {
        const rawMarkdown = await importFn();
        // return parseMarkdownArticle(rawMarkdown, path);
        return parseMarkdownArticle(rawMarkdown.default, path);
      } catch (err) {
        console.error(`Error loading ${path}:`, err);
        return null;
      }
    },
  );

  const articles = (await Promise.all(articlePromises)).filter(Boolean);

  return articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export { loadArticles };
