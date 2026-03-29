# Code Block Examples

A showcase of syntax-highlighted code blocks in various programming languages.

## Table of Contents

- [TypeScript](#typescript)
- [JavaScript](#javascript)
- [Python](#python)
- [Bash/Shell](#bashshell)
- [HTML & CSS](#html--css)
- [JSON](#json)
- [SQL](#sql)
- [Terminal Output](#terminal-output)

## TypeScript

TypeScript with full type annotations and modern features.

### Interface and Function

```typescript
interface BlogPost {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  tags: string[];
  author: {
    name: string;
    email: string;
  };
}

function createBlogPost(
  title: string,
  content: string,
  tags: string[] = []
): BlogPost {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    publishedAt: new Date(),
    tags,
    author: {
      name: 'Naranyala',
      email: 'hello@example.com',
    },
  };
}

// Usage
const post = createBlogPost(
  'My First Post',
  'Hello, World!',
  ['introduction', 'welcome']
);

console.log(`Created post: ${post.id}`);
```

### Class with Decorators

```typescript
@Component({
  selector: 'app-blog',
  template: `
    <div class="blog-container">
      <h1>{{ title }}</h1>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .blog-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
  `],
})
export class BlogComponent implements OnInit {
  @Input() title = 'My Blog';
  @Output() postPublished = new EventEmitter<Post>();
  
  private readonly posts: Post[] = [];
  
  constructor(private readonly postService: PostService) {}
  
  async ngOnInit(): Promise<void> {
    const posts = await this.postService.getAll();
    this.posts.push(...posts);
  }
  
  publishPost(post: Post): void {
    this.postService.create(post);
    this.postPublished.emit(post);
  }
}
```

### Async/Await Pattern

```typescript
async function fetchBlogPosts(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResult<Post[]>> {
  try {
    const response = await fetch(
      `/api/posts?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      data: data.posts,
      total: data.total,
      page,
      limit,
      hasMore: page * limit < data.total,
    };
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
}

// With retry logic
async function fetchWithRetry(
  url: string,
  retries: number = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * (i + 1))
      );
    }
  }
  throw new Error('Max retries reached');
}
```

## JavaScript

Modern ES6+ JavaScript with async patterns.

### Module Exports

```javascript
/**
 * Blog utilities module
 * @module blog/utils
 */

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

export default {
  formatDate,
  slugify,
  truncate: (text, length = 100) => {
    return text.length > length 
      ? text.slice(0, length) + '...' 
      : text;
  },
};
```

### Event Handling

```javascript
class BlogReader {
  constructor(container) {
    this.container = container;
    this.scrollProgress = 0;
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', this.handleScroll.bind(this));
    document.querySelectorAll('.code-block').forEach(block => {
      block.addEventListener('copy', this.handleCopy.bind(this));
    });
  }
  
  handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    this.scrollProgress = (scrollTop / docHeight) * 100;
    this.updateProgressBar();
  }
  
  handleCopy(event) {
    const code = event.target.querySelector('code').textContent;
    navigator.clipboard.writeText(code);
    this.showCopyFeedback();
  }
  
  updateProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (bar) {
      bar.style.width = `${this.scrollProgress}%`;
    }
  }
  
  showCopyFeedback() {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Copied!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
}
```

## Python

Python 3.x with type hints and modern features.

### Data Processing

```python
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional

@dataclass
class BlogPost:
    """Represents a blog post"""
    title: str
    content: str
    tags: List[str]
    published_at: Optional[datetime] = None
    draft: bool = True
    
    def publish(self) -> None:
        """Publish the blog post"""
        self.published_at = datetime.now()
        self.draft = False
    
    def word_count(self) -> int:
        """Count words in the post"""
        return len(self.content.split())
    
    def reading_time(self, wpm: int = 200) -> int:
        """Calculate reading time in minutes"""
        return max(1, self.word_count() // wpm)

# Usage
post = BlogPost(
    title="My First Post",
    content="Hello, World! " * 100,
    tags=["introduction", "welcome"]
)

print(f"Reading time: {post.reading_time()} minutes")
post.publish()
print(f"Published at: {post.published_at}")
```

### Web Scraping

```python
import requests
from bs4 import BeautifulSoup
from typing import Dict, List

def scrape_blog_posts(url: str) -> List[Dict]:
    """Scrape blog posts from a URL"""
    response = requests.get(url)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    posts = []
    
    for article in soup.select('.blog-post'):
        post = {
            'title': article.select_one('h2').text.strip(),
            'link': article.select_one('a')['href'],
            'date': article.select_one('.date').text.strip(),
            'tags': [
                tag.text for tag in article.select('.tag')
            ],
        }
        posts.append(post)
    
    return posts

# Batch processing
def process_posts(posts: List[Dict], batch_size: int = 10):
    """Process posts in batches"""
    for i in range(0, len(posts), batch_size):
        batch = posts[i:i + batch_size]
        print(f"Processing batch {i // batch_size + 1}")
        
        for post in batch:
            # Process each post
            yield post

# Usage
posts = scrape_blog_posts('https://example.com/blog')
for post in process_posts(posts):
    print(f"Processed: {post['title']}")
```

## Bash/Shell

Shell scripts for automation.

### Deployment Script

```bash
#!/bin/bash

# Blog Deployment Script
# Usage: ./deploy.sh [environment]

set -e  # Exit on error

# Configuration
ENVIRONMENT=${1:-production}
BUILD_DIR="dist"
REMOTE_USER="deploy"
REMOTE_HOST="blog.example.com"
REMOTE_PATH="/var/www/blog"

# Colors for output
RED='\\e[0;31m'
GREEN='\\e[0;32m'
YELLOW='\\e[1;33m'
NC='\\e[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to ${ENVIRONMENT}${NC}"

# Step 1: Build
echo -e "${YELLOW}Building project...${NC}"
bun run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Step 2: Test
echo -e "${YELLOW}Running tests...${NC}"
bun test

# Step 3: Deploy
echo -e "${YELLOW}Deploying to server...${NC}"
rsync -avz \
    --delete \
    --exclude '.git' \
    ${BUILD_DIR}/ \
    ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# Step 4: Restart services
echo -e "${YELLOW}Restarting services...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
    sudo systemctl restart nginx
    sudo systemctl reload php-fpm
ENDSSH

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "View your site at: https://${REMOTE_HOST}"
```

### Photo Organization

```bash
#!/bin/bash

# Organize photos by date
PHOTOS_DIR="$1"

if [ -z "$PHOTOS_DIR" ]; then
    echo "Usage: $0 <photos_directory>"
    exit 1
fi

cd "$PHOTOS_DIR" || exit

# Process each JPG file
for photo in *.JPG *.jpg; do
    [ -f "$photo" ] || continue
    
    # Extract date from filename (assumes YYYYMMDD format)
    DATE=$(echo "$photo" | grep -oE '[0-9]{8}' | head -1)
    
    if [ -n "$DATE" ]; then
        YEAR=${DATE:0:4}
        MONTH=${DATE:4:2}
        
        # Create directory structure
        mkdir -p "$YEAR/$MONTH"
        
        # Move photo
        mv "$photo" "$YEAR/$MONTH/"
        echo "Moved: $photo -> $YEAR/$MONTH/"
    else
        echo "Skipping (no date): $photo"
    fi
done

echo "Done!"
```

## HTML & CSS

Modern HTML5 and CSS3.

### Semantic HTML

```html
<article class="blog-post">
  <header class="post-header">
    <h1 class="post-title">My Amazing Journey</h1>
    <div class="post-meta">
      <time datetime="2026-03-30">March 30, 2026</time>
      <span class="post-author">By Naranyala</span>
    </div>
    <img 
      src="/images/journey-hero.jpg" 
      alt="Beautiful landscape from my journey"
      loading="lazy"
      class="post-hero-image"
    >
  </header>
  
  <div class="post-content">
    <p class="lead">This is the story of my incredible adventure...</p>
    
    <section>
      <h2>The Beginning</h2>
      <p>It all started when...</p>
    </section>
    
    <figure>
      <img src="/images/moment.jpg" alt="A special moment">
      <figcaption>Capturing the perfect moment</figcaption>
    </figure>
  </div>
  
  <footer class="post-footer">
    <div class="post-tags">
      <a href="/tag/travel">travel</a>
      <a href="/tag/adventure">adventure</a>
    </div>
    <div class="post-share">
      <button class="share-twitter">Share on Twitter</button>
      <button class="share-facebook">Share on Facebook</button>
    </div>
  </footer>
</article>
```

### CSS Grid Layout

```css
.blog-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-areas:
    "header header"
    "main sidebar"
    "footer footer";
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .blog-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}

.header { grid-area: header; }
.main { grid-area: main; }
.sidebar { grid-area: sidebar; }
.footer { grid-area: footer; }

/* Card hover effects */
.post-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}
```

## JSON

Configuration and data structures.

### Blog Configuration

```json
{
  "blog": {
    "title": "Naranyala's Blog",
    "description": "Stories, experiences, and creative projects",
    "url": "https://naranyala.com",
    "language": "en-US",
    "author": {
      "name": "Naranyala",
      "email": "hello@example.com",
      "social": {
        "twitter": "@naranyala",
        "instagram": "@naranyala"
      }
    }
  },
  "seo": {
    "googleAnalytics": "GA-XXXXX",
    "sitemap": true,
    "robotsTxt": true
  },
  "features": {
    "comments": true,
    "newsletter": true,
    "search": true,
    "darkMode": true
  }
}
```

### API Response

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post-123",
        "title": "My Creative Journey",
        "slug": "my-creative-journey",
        "excerpt": "A story about finding creativity...",
        "publishedAt": "2026-03-30T09:00:00Z",
        "tags": ["creativity", "lifestyle"],
        "readingTime": 8,
        "coverImage": "/images/creative-journey.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalPosts": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## SQL

Database queries.

### Blog Database Schema

```sql
-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for slug lookups
CREATE INDEX idx_posts_slug ON posts(slug);

-- Create index for published posts
CREATE INDEX idx_posts_published 
ON posts(published_at) 
WHERE status = 'published';

-- Query recent published posts
SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.published_at,
    COUNT(c.id) as comment_count
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
WHERE p.status = 'published'
  AND p.published_at <= NOW()
GROUP BY p.id
ORDER BY p.published_at DESC
LIMIT 10;
```

## Terminal Output

Console and terminal output examples.

### Build Output

```terminal
$ bun run build

> Building...
✓ TypeScript compilation complete (2.3s)
✓ Bundling complete (1.8s)
✓ Optimization complete (0.9s)

Build completed successfully!

Output:
  dist/
  ├── index.html (2.4 kB)
  ├── main.js (842 kB)
  ├── styles.css (156 kB)
  └── assets/
      ├── images/ (24 files)
      └── fonts/ (6 files)

Total size: 1.2 MB
Build time: 5.0s
```

### Git Commands

```terminal
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   src/app/article-reader.ts
        new file:   docs/mermaid-examples.md

$ git commit -m "Add Mermaid.js examples article"
[main 8f3a2b1] Add Mermaid.js examples article
 2 files changed, 347 insertions(+)
 create mode 100644 docs/mermaid-examples.md

$ git push
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (9/9), 1.24 KiB | 1.24 MiB, done.
Total 9 (delta 6), reused 0 (delta 0)
remote: Resolving deltas: 100% (6/6)
To github.com:naranyala/blog.git
   3a2b1c4..8f3a2b1  main -> main
```

---

## Syntax Highlighting Features

The code blocks support:

✅ **Multiple languages** - TypeScript, JavaScript, Python, Bash, etc.  
✅ **Line numbers** - For easy reference  
✅ **Copy button** - One-click copy  
✅ **Language badge** - Shows the language  
✅ **Custom titles** - Optional file names  
✅ **Terminal theme** - Special styling for terminal output  
✅ **Diff highlighting** - Show code changes  

## How to Use

````markdown
```language
your code here
```
````

Replace `language` with: `typescript`, `javascript`, `python`, `bash`, `html`, `css`, `json`, `sql`, `terminal`, etc.

---

**Happy Coding!** 🚀

*Which language do you use most? Let me know in the comments!*
