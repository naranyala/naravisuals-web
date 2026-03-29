# Technical Demo: Code & Diagrams

This article demonstrates the full capabilities of code syntax highlighting and Mermaid.js diagram rendering.

## Table of Contents

- [Code Syntax Highlighting](#code-syntax-highlighting)
- [Mermaid.js Diagrams](#mermaidjs-diagrams)
- [Tables with Borders](#tables-with-borders)
- [Mixed Content](#mixed-content)

## Code Syntax Highlighting

### TypeScript Example

Here's a complete Angular component with decorators and type safety:

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  tags: string[];
}

@Component({
  selector: 'app-blog-post',
  template: `
    <article class="post">
      <h1>{{ post.title }}</h1>
      <time>{{ post.publishedAt | date }}</time>
      <div [innerHTML]="post.content"></div>
    </article>
  `,
  styles: [`
    .post {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
  `],
})
export class BlogPostComponent {
  @Input() post!: BlogPost;
  @Output() share = new EventEmitter<void>();
  
  constructor(private readonly analytics: AnalyticsService) {}
  
  async ngOnInit(): Promise<void> {
    await this.analytics.track('post_view', {
      postId: this.post.id,
    });
  }
  
  onShare(): void {
    this.share.emit();
  }
}
```

### Python Data Processing

A complete example with dataclasses and type hints:

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict
from pathlib import Path

@dataclass
class BlogAnalytics:
    """Track blog post analytics"""
    post_id: str
    views: int = 0
    shares: int = 0
    comments: int = 0
    metadata: Dict[str, any] = field(default_factory=dict)
    
    def add_view(self) -> None:
        """Increment view count"""
        self.views += 1
        self.metadata['last_view'] = datetime.now()
    
    def get_engagement_rate(self) -> float:
        """Calculate engagement rate"""
        if self.views == 0:
            return 0.0
        return (self.shares + self.comments) / self.views * 100
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'post_id': self.post_id,
            'views': self.views,
            'engagement_rate': f"{self.get_engagement_rate():.2f}%",
        }

# Usage example
if __name__ == '__main__':
    analytics = BlogAnalytics(post_id='post-123')
    analytics.add_view()
    print(analytics.to_dict())
```

### Bash Automation Script

Complete deployment script with error handling:

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

# Colors
RED='\\e[0;31m'
GREEN='\\e[0;32m'
YELLOW='\\e[1;33m'
BLUE='\\e[0;34m'
NC='\\e[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Main deployment function
deploy() {
    log_info "Starting deployment to ${ENVIRONMENT}"
    
    # Step 1: Build
    log_info "Building project..."
    if bun run build; then
        log_success "Build completed"
    else
        log_error "Build failed!"
        exit 1
    fi
    
    # Step 2: Test
    log_info "Running tests..."
    if bun test; then
        log_success "All tests passed"
    else
        log_warning "Some tests failed"
        read -p "Continue anyway? (y/n) " -n 1 -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Step 3: Deploy
    log_info "Deploying to server..."
    rsync -avz \
        --delete \
        --exclude '.git' \
        ${BUILD_DIR}/ \
        ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
    
    log_success "Deployment complete!"
    log_info "View your site at: https://${REMOTE_HOST}"
}

# Run deployment
deploy
```

### JavaScript Class with Async Operations

Modern ES6+ with async/await and error handling:

```javascript
/**
 * Blog API Client
 * Handles all API communication for the blog
 */
class BlogApiClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.cache = new Map();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('📦 Returning cached response');
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getPosts(page = 1, limit = 10) {
    return this.request(`/posts?page=${page}&limit=${limit}`);
  }

  async getPost(slug) {
    return this.request(`/posts/${slug}`);
  }

  async createPost(postData) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }
}

// Usage
const api = new BlogApiClient('https://api.example.com', 'your-api-key');
const posts = await api.getPosts(1, 20);
console.log(`Loaded ${posts.length} posts`);
```

## Mermaid.js Diagrams

### Flowchart: Content Creation Process

This shows my complete content creation workflow:

```mermaid
flowchart TD
    A[💡 Inspiration] --> B{Worth Pursuing?}
    B -->|No| C[🗑️ Discard]
    B -->|Yes| D[📝 Planning]
    D --> E[✍️ Content Creation]
    E --> F{Content Type?}
    F -->|Blog Post| G[Writing + Photos]
    F -->|Video| H[Recording + Editing]
    F -->|Photo Essay| I[Photo Selection]
    G --> J[👀 Review]
    H --> J
    I --> J
    J --> K{Ready?}
    K -->|No| E
    K -->|Yes| L[🚀 Publish]
    L --> M[📱 Share on Social]
    M --> N[💬 Engage with Audience]
    N --> O[📊 Analyze Performance]
    O --> P[📈 Learn & Improve]
    P --> A
```

### Sequence Diagram: Blog Publishing Flow

Shows the technical flow from draft to published:

```mermaid
sequenceDiagram
    autonumber
    participant Author
    participant CMS as Content Management
    participant Build as Build System
    participant Server as Web Server
    participant CDN as CDN
    participant User

    Author->>CMS: Create Draft
    CMS-->>Author: Draft Saved ✓
    
    Author->>CMS: Submit for Review
    CMS->>Build: Trigger Build
    Build->>Build: Install Dependencies
    Build->>Build: Compile TypeScript
    Build->>Build: Bundle Assets
    Build->>Build: Optimize Images
    Build-->>CMS: Build Success ✓
    
    CMS->>Server: Deploy Files
    Server->>CDN: Invalidate Cache
    CDN-->>Server: Cache Cleared ✓
    Server-->>CMS: Deployment Complete ✓
    CMS-->>Author: Published! 🎉
    
    User->>CDN: Request Page
    CDN-->>User: Serve Content ⚡
```

### Class Diagram: Blog System Architecture

Shows the database schema and relationships:

```mermaid
classDiagram
    class BlogPost {
        +string id
        +string title
        +string slug
        +string content
        +DateTime publishedAt
        +string status
        +publish()
        +update()
        +delete()
    }
    
    class Author {
        +string id
        +string name
        +string email
        +string bio
        +getPosts()
        +writePost()
    }
    
    class Category {
        +string id
        +string name
        +string slug
        +getPosts()
    }
    
    class Tag {
        +string id
        +string name
        +string slug
    }
    
    class Comment {
        +string id
        +string content
        +DateTime createdAt
        +bool approved
        +approve()
        +delete()
    }
    
    class Analytics {
        +string postId
        +int views
        +int shares
        +trackView()
        +getStats()
    }
    
    Author "1" --> "*" BlogPost : writes
    BlogPost "*" --> "*" Category : categorized
    BlogPost "*" --> "*" Tag : tagged
    BlogPost "1" --> "*" Comment : has
    BlogPost "1" --> "1" Analytics : tracked
```

### State Diagram: Article Lifecycle

Shows all possible states of a blog post:

```mermaid
stateDiagram-v2
    [*] --> Draft : Create
    Draft --> Review : Submit
    Draft --> [*] : Delete
    
    Review --> Draft : Request Changes
    Review --> Approved : Approve
    Review --> Rejected : Reject
    
    Approved --> Scheduled : Schedule
    Approved --> Published : Publish Immediately
    
    Scheduled --> Published : Publish Time Reached
    Scheduled --> Draft : Cancel Schedule
    
    Published --> Updated : Edit
    Updated --> Published : Save Changes
    Published --> Archived : Archive
    
    Archived --> Published : Restore
    Archived --> [*] : Permanent Delete
    
    Rejected --> Draft : Revise
    Rejected --> [*] : Discard
```

### Gantt Chart: Content Calendar

Project timeline for monthly content:

```mermaid
gantt
    title Blog Content Calendar - April 2026
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    
    section Week 1 (Apr 1-7)
    Research Topics       :a1, 2026-04-01, 2d
    Write First Draft     :a2, after a1, 3d
    Add Images            :a3, after a2, 2d
    
    section Week 2 (Apr 8-14)
    Edit Content          :b1, 2026-04-08, 2d
    SEO Optimization      :b2, after b1, 1d
    Publish Post          :b3, after b2, 1d
    
    section Week 3 (Apr 15-21)
    Social Media Campaign :c1, 2026-04-15, 3d
    Engage Comments       :c2, after c1, 4d
    
    section Week 4 (Apr 22-30)
    Analytics Review      :d1, 2026-04-22, 2d
    Plan May Content      :d2, after d1, 3d
    Buffer Days           :d3, after d2, 2d
```

### Pie Chart: Content Distribution

Shows the breakdown of content types:

```mermaid
pie title Blog Content by Category
    "Travel Stories" : 25
    "Lifestyle" : 30
    "Creative Projects" : 20
    "Personal Growth" : 15
    "Technical Tutorials" : 10
```

### Mind Map: Content Strategy

Hierarchical organization of content strategy:

```mermaid
mindmap
  root((Content Strategy))
    Planning
      Research
        Trend Analysis
        Keyword Research
      Calendar
        Monthly Plan
        Weekly Schedule
    Creation
      Writing
        First Draft
        Editing
      Visuals
        Photography
        Graphics
    Distribution
      Blog
      Social Media
        Instagram
        Twitter
        LinkedIn
      Newsletter
        Weekly Digest
    Engagement
      Comments
      Email Replies
      Social Interactions
    Analytics
      Page Views
      Engagement Rate
      Conversion
```

## Tables with Borders

### Content Categories Table

Full table with all borders visible:

| Category | Posts | Avg Read Time | Engagement Rate | Last Updated |
|----------|-------|---------------|-----------------|--------------|
| Travel | 25 | 8 min | 4.2% | 2026-03-28 |
| Lifestyle | 30 | 6 min | 5.1% | 2026-03-29 |
| Creative | 20 | 10 min | 3.8% | 2026-03-27 |
| Growth | 15 | 7 min | 4.5% | 2026-03-30 |
| Technical | 10 | 12 min | 6.2% | 2026-03-26 |

### Technology Stack Table

Another example with different content:

| Technology | Purpose | Version | Status |
|------------|---------|---------|--------|
| Angular | Frontend Framework | 19.x | ✅ Active |
| Rspack | Build Tool | 1.x | ✅ Active |
| Bun | Runtime & Package Manager | 1.x | ✅ Active |
| TypeScript | Language | 5.x | ✅ Active |
| Marked | Markdown Parser | 17.x | ✅ Active |
| Mermaid | Diagram Library | 11.x | ✅ Active |

### Social Media Platforms Table

Table showing platform statistics:

| Platform | Followers | Posts | Engagement | Priority |
|----------|-----------|-------|------------|----------|
| Instagram | 15.2K | 342 | 4.8% | 🔴 High |
| Twitter | 8.5K | 1,247 | 3.2% | 🟡 Medium |
| LinkedIn | 5.1K | 89 | 5.6% | 🟢 Low |
| YouTube | 2.3K | 45 | 7.1% | 🟡 Medium |

## Mixed Content

### Code + Diagram Combination

Here's how I process photos, shown in both code and diagram:

```python
from PIL import Image
from pathlib import Path

def process_photo(input_path: str, output_path: str) -> dict:
    """Process a photo with standard adjustments"""
    img = Image.open(input_path)
    
    # Basic adjustments
    img = img.adjust_brightness(1.2)
    img = img.adjust_contrast(1.1)
    img = img.adjust_saturation(1.3)
    
    # Resize for web
    img.thumbnail((1920, 1080))
    
    # Save with optimization
    img.save(output_path, optimize=True, quality=85)
    
    return {
        'original_size': img.size,
        'output_path': output_path,
        'format': img.format,
    }
```

The workflow visualized:

```mermaid
flowchart LR
    A[📸 Raw Photo] --> B[💡 Adjustments]
    B --> C[📐 Resize]
    C --> D[💾 Export]
    D --> E[🌐 Upload]
    E --> F[📤 Publish]
```

---

## Summary

This article demonstrates:

✅ **Syntax Highlighting** - TypeScript, Python, Bash, JavaScript  
✅ **Mermaid Diagrams** - 8 different diagram types  
✅ **Tables with Borders** - Full border styling on all cells  
✅ **Mixed Content** - Code and diagrams together  
✅ **Responsive Design** - Works on mobile and desktop  

---

**Questions?** Drop them in the comments below! 👇
