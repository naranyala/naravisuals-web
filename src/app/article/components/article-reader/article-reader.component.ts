import { Component, EventEmitter, Input, inject, type OnInit, OnDestroy, Output, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import type { Article } from '../../../services/article.service';
import { TablerIconComponent } from '../../../shared/components/tabler-icon/tabler-icon.component';
import {
  TableOfContentsComponent,
  type TocItem,
} from '../table-of-contents/table-of-contents.component';

@Component({
  selector: 'app-article-reader',
  standalone: true,
  imports: [TablerIconComponent],
  template: `
    <div class="article-fullscreen">
      <div class="sticky-bar">
        <button class="back-btn" (click)="onBack()" aria-label="Go back">
          <tabler-icon name="arrowLeft" [size]="18" />
          <span>Back</span>
        </button>
        <button class="toc-toggle-btn" (click)="toggleToc()" aria-label="Toggle table of contents">
          <tabler-icon [name]="tocExpanded() ? 'x' : 'list'" [size]="18" />
          <span class="toc-toggle-text">{{ tocExpanded() ? 'Close' : 'Contents' }}</span>
        </button>
      </div>
      <div class="article-layout">
        <article class="article-content" [innerHTML]="renderedContent()"></article>

        @if (tableOfContents().length > 0) {
          <aside class="toc-sidebar" [class.toc-expanded]="tocExpanded()">
            <div class="toc-header">
              <h3>On this page</h3>
              <button class="toc-close-btn" (click)="toggleToc()" aria-label="Close table of contents">
                <tabler-icon name="x" [size]="18" />
              </button>
            </div>
            <nav class="toc-nav">
              <ul class="toc-list">
                @for (item of tableOfContents(); track item.id) {
                  <li class="toc-item" [class.level-2]="item.level === 2" [class.level-3]="item.level === 3">
                    <a
                      [href]="'#' + item.id"
                      (click)="onTocClick($event, item.id)"
                      [class.active]="activeHeading() === item.id">
                      {{ item.text }}
                    </a>
                  </li>
                }
              </ul>
            </nav>
          </aside>
        }
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      display: block;
    }

    .article-fullscreen {
      position: fixed;
      inset: 0;
      background: #0d1117;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      contain: layout style paint;
    }

    .sticky-bar {
      position: sticky;
      top: 0;
      background: rgba(13,17,23,0.98);
      backdrop-filter: blur(12px);
      padding: 16px 24px;
      border-bottom: 1px solid #30363d;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .back-btn {
      background: transparent;
      border: 1px solid #30363d;
      color: #8b949e;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .back-btn:hover {
      background: #21262d;
      border-color: #484f58;
      color: #e6edf3;
    }

    .toc-toggle-btn {
      background: transparent;
      border: 1px solid #30363d;
      color: #8b949e;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
      display: none;
      align-items: center;
      gap: 6px;
    }

    .toc-toggle-btn:hover {
      background: #21262d;
      border-color: #484f58;
      color: #e6edf3;
    }

    @media (max-width: 1024px) {
      .toc-toggle-btn {
        display: flex;
      }
    }

    .toc-toggle-text {
      display: none;
    }

    @media (min-width: 640px) {
      .toc-toggle-text {
        display: inline;
      }
    }

    .article-layout {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 64px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 48px;
      overflow-y: auto;
      flex: 1;
      scroll-behavior: smooth;
    }

    @media (max-width: 1024px) {
      .article-layout {
        grid-template-columns: 1fr;
        gap: 32px;
        padding: 32px 32px;
      }
    }

    @media (max-width: 640px) {
      .article-layout {
        padding: 24px 20px;
      }
    }

    /* ===== TOC SIDEBAR ===== */
    .toc-sidebar {
      position: sticky;
      top: 80px;
      align-self: flex-start;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 20px;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }

    @media (max-width: 1024px) {
      .toc-sidebar {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-height: none;
        z-index: 1000;
        border-radius: 0;
        border: none;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        background: #0d1117;
      }

      .toc-sidebar.toc-expanded {
        transform: translateY(0);
      }
    }

    .toc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #30363d;
    }

    .toc-header h3 {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .toc-close-btn {
      background: transparent;
      border: none;
      color: #8b949e;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: none;
      transition: all 0.2s;
    }

    .toc-close-btn:hover {
      background: #21262d;
      color: #e6edf3;
    }

    @media (max-width: 1024px) {
      .toc-close-btn {
        display: flex;
      }
    }

    .toc-nav {
      overflow-y: auto;
      max-height: calc(100vh - 200px);
    }

    @media (max-width: 1024px) {
      .toc-nav {
        max-height: none;
      }
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-item {
      margin-bottom: 8px;
    }

    .toc-item.level-2 {
      margin-left: 12px;
    }

    .toc-item.level-3 {
      margin-left: 24px;
    }

    .toc-item a {
      display: block;
      padding: 8px 12px;
      color: #8b949e;
      text-decoration: none;
      font-size: 0.875rem;
      line-height: 1.4;
      border-radius: 6px;
      transition: all 0.2s;
      border-left: 2px solid transparent;
    }

    .toc-item a:hover {
      background: rgba(139, 148, 158, 0.1);
      color: #e6edf3;
      border-left-color: #8b949e;
    }

    .toc-item a.active {
      background: rgba(88, 166, 255, 0.1);
      color: #58a6ff;
      border-left-color: #58a6ff;
      font-weight: 500;
    }

    .article-content {
      background: transparent;
      padding: 0;
      font-size: 1.0625rem;
      line-height: 1.75;
      color: #c9d1d9;
    }

    .article-content :global(h1) {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #30363d;
      letter-spacing: -0.5px;
      color: #e6edf3;
    }

    .article-content :global(h2) {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 48px 0 20px;
      letter-spacing: -0.3px;
      color: #e6edf3;
    }

    .article-content :global(h3) {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 32px 0 16px;
      color: #e6edf3;
    }

    .article-content :global(h4) {
      font-size: 1.0625rem;
      font-weight: 600;
      margin: 24px 0 12px;
      color: #e6edf3;
    }

    .article-content :global(p) {
      line-height: 1.75;
      margin: 20px 0;
      color: #c9d1d9;
      text-rendering: optimizeLegibility;
    }

    .article-content :global(a) {
      color: #58a6ff;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }

    .article-content :global(a:hover) {
      border-bottom-color: #58a6ff;
    }

    .article-content :global(ul),
    .article-content :global(ol) {
      margin: 20px 0;
      padding-left: 28px;
      color: #c9d1d9;
    }

    .article-content :global(li) {
      margin: 10px 0;
      line-height: 1.7;
      padding-left: 4px;
    }

    .article-content :global(blockquote) {
      border-left: 3px solid #1f6feb;
      margin: 24px 0;
      padding: 16px 20px;
      background: rgba(31,111,235,0.08);
      color: #8b949e;
      border-radius: 0 8px 8px 0;
      font-size: 1rem;
    }

    .article-content :global(blockquote p) {
      margin: 0;
    }

    .article-content :global(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 0.9375rem;
      border: 1px solid #30363d;
    }

    .article-content :global(th),
    .article-content :global(td) {
      border: 1px solid #30363d;
      padding: 12px 14px;
      text-align: left;
    }

    .article-content :global(th) {
      background: #21262d;
      font-weight: 600;
      color: #e6edf3;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #30363d;
    }

    .article-content :global(tr) {
      border: 1px solid #30363d;
    }

    .article-content :global(tr:nth-child(even)) {
      background: rgba(255,255,255,0.02);
    }

    .article-content :global(hr) {
      border: none;
      border-top: 1px solid #30363d;
      margin: 40px 0;
    }

    .article-content :global(img) {
      max-width: 100%;
      border-radius: 8px;
      border: 1px solid #30363d;
    }

    /* Inline code */
    .article-content :global(.inline-code) {
      background: rgba(110, 118, 129, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.875em;
      color: #e6edf3;
      white-space: nowrap;
    }

    /* Article images */
    .article-content :global(.article-image) {
      display: block;
      margin: 24px auto;
      max-height: 600px;
      object-fit: cover;
    }
  `,
  ],
})
export class ArticleReaderComponent implements OnInit, OnDestroy {
  @Input() article: Article | null = null;
  @Output() back = new EventEmitter<void>();

  readonly renderedContent = signal<SafeHtml>('');
  readonly tableOfContents = signal<TocItem[]>([]);
  readonly activeHeading = signal<string>('');
  readonly tocExpanded = signal<boolean>(false);

  private readonly sanitizer = inject(DomSanitizer);
  private observer?: IntersectionObserver;

  ngOnInit() {
    // Lock body scroll when article reader opens
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    if (this.article) {
      this.loadArticle(this.article);
    }
  }

  ngOnDestroy() {
    // Restore body scroll when component destroys
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleToc() {
    this.tocExpanded.update(v => !v);
  }

  ngOnChanges() {
    if (this.article) {
      this.loadArticle(this.article);
    }
  }

  private async loadArticle(article: Article) {
    try {
      const { html, toc } = await this.renderMarkdown(article.content);
      this.tableOfContents.set(toc);
      this.renderedContent.set(this.sanitizer.bypassSecurityTrustHtml(html));

      setTimeout(() => {
        this.setupScrollSpy();
      }, 100);
    } catch (error) {
      console.error('[ArticleReader] Failed to render article:', error);
      this.renderedContent.set(
        this.sanitizer.bypassSecurityTrustHtml(`
        <div style="padding: 20px; background: rgba(248,81,73,0.1); border: 1px solid #f85149; border-radius: 8px;">
          <h3 style="color: #f85149; margin-top: 0;">Rendering Error</h3>
          <p style="color: #e6edf3;">${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        </div>
      `)
      );
    }
  }

  private setupScrollSpy() {
    // Clean up previous observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Wait for content to render
    setTimeout(() => {
      const headings = document.querySelectorAll('.article-content h2, .article-content h3, .article-content h4');
      
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.activeHeading.set(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-100px 0px -60% 0px',
          threshold: 0,
        }
      );

      headings.forEach(heading => this.observer!.observe(heading));
    }, 100);
  }

  private expandTocAndScrollToFirst(toc: TocItem[]) {
    if (toc.length > 0) {
      const firstHeading = toc[0];
      setTimeout(() => {
        const tocElement = document.querySelector(
          `.toc a[href="#${firstHeading.id}"]`
        ) as HTMLElement;
        if (tocElement) {
          tocElement.style.color = '#58a6ff';
          tocElement.style.background = 'rgba(88,166,255,0.08)';
          tocElement.style.borderLeftColor = '#58a6ff';
        }

        const headingElement = document.getElementById(firstHeading.id);
        if (headingElement) {
          headingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }

  onBack() {
    this.back.emit();
  }

  onTocClick(event: Event, headingId: string) {
    event.preventDefault();
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeHeading.set(headingId);
      // Close TOC on mobile after clicking
      if (window.innerWidth < 1024) {
        this.tocExpanded.set(false);
      }
    }
  }

  private async renderMarkdown(content: string): Promise<{ html: string; toc: TocItem[] }> {
    const toc: TocItem[] = [];

    if (!content || typeof content !== 'string') {
      throw new Error('Invalid markdown content');
    }

    // Configure marked with GFM support (includes tables)
    marked.setOptions({
      gfm: true,        // GitHub Flavored Markdown (tables, etc.)
      breaks: true,     // Convert \n to <br>
      async: false,
    });

    // Parse markdown to tokens
    const tokens = marked.lexer(content);

    // Process tokens to add IDs to headings and extract TOC
    const processedTokens = tokens.map((token: any) => {
      if (token.type === 'heading') {
        const id = this.slugify(token.text);
        toc.push({ id, text: token.text, level: token.depth });
        return { ...token, id };
      }
      return token;
    });

    // Convert tokens back to HTML
    const html = marked.parser(processedTokens);

    // Post-process HTML to wrap code blocks and add mermaid components
    const processedHtml = this.processHtmlForComponents(html);

    return { html: processedHtml, toc };
  }

  private processHtmlForComponents(html: string): string {
    let processed = html;

    // Convert code blocks to app-code-block components
    processed = processed.replace(
      /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
      (match, lang, code) => {
        if (lang === 'mermaid') {
          const diagramId = 'mermaid-' + Math.random().toString(36).substring(2, 9);
          return `<app-mermaid-diagram diagram-id="${diagramId}" code="${this.escapeHtml(code)}"></app-mermaid-diagram>`;
        }
        const title = lang === 'plaintext' ? 'Code' : lang.toUpperCase();
        return `<app-code-block code="${this.escapeHtml(code)}" lang="${lang}" title="${title}" enable-highlighting="true"></app-code-block>`;
      }
    );

    // Convert inline code
    processed = processed.replace(
      /<code>([^<]+)<\/code>/g,
      '<code class="inline-code">$1</code>'
    );

    return processed;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
