import { Component, EventEmitter, Input, inject, type OnInit, Output, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import type { Article } from '../../../services/article.service';
import { TablerIconComponent } from '../../../shared/components/tabler-icon/tabler-icon.component';
import {
  TableOfContentsComponent,
  type TocItem,
} from '../table-of-contents/table-of-contents.component';

@Component({
  selector: 'app-article-reader',
  standalone: true,
  imports: [TableOfContentsComponent, TablerIconComponent],
  template: `
    <div class="article-fullscreen">
      <div class="sticky-bar">
        <button class="back-btn" (click)="onBack()" aria-label="Go back">
          <tabler-icon name="arrowLeft" [size]="18" />
          <span>Back</span>
        </button>
      </div>
      <div class="article-layout">
        <article class="article-content" [innerHTML]="renderedContent()"></article>

        @if (tableOfContents().length > 0) {
          <app-table-of-contents
            [items]="tableOfContents()"
            (itemClick)="onTocClick($event)">
          </app-table-of-contents>
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
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #0d1117;
      z-index: 1000;
      overflow-y: auto;
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

    .article-layout {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 64px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 48px;
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
  `,
  ],
})
export class ArticleReaderComponent implements OnInit {
  @Input() article: Article | null = null;
  @Output() back = new EventEmitter<void>();

  readonly renderedContent = signal<SafeHtml>('');
  readonly tableOfContents = signal<TocItem[]>([]);

  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit() {
    if (this.article) {
      this.loadArticle(this.article);
    }
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
        this.expandTocAndScrollToFirst(toc);
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

  onTocClick(headingId: string) {}

  private async renderMarkdown(content: string): Promise<{ html: string; toc: TocItem[] }> {
    const toc: TocItem[] = [];
    let md = content;

    if (!md || typeof md !== 'string') {
      throw new Error('Invalid markdown content');
    }

    md = md.replace(/^(#{1,4})\s+(.+)$/gm, (_, hs, text) => {
      const lvl = hs.length;
      const id = this.slugify(text);
      toc.push({ id, text, level: lvl });
      return `<h${lvl} id="${id}">${text}</h${lvl}>`;
    });

    md = md.replace(/```[\s\S]*?```/g, '');

    md = md.replace(/`[^`]+`/g, '');

    md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    md = md.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    md = md.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>');
    md = md.replace(/^---\s*$/gm, '<hr>');

    const lines = md.split('\n');
    const out: string[] = [];
    let inUl = false,
      inOl = false,
      inBlockquote = false,
      inTable = false;
    let tableRows: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inUl) {
          out.push('</ul>');
          inUl = false;
        }
        if (inOl) {
          out.push('</ol>');
          inOl = false;
        }
        if (inBlockquote) {
          out.push('</blockquote>');
          inBlockquote = false;
        }
        continue;
      }

      if (trimmed.startsWith('<h') || trimmed.startsWith('<app-') || trimmed.startsWith('<hr')) {
        if (inUl) {
          out.push('</ul>');
          inUl = false;
        }
        if (inOl) {
          out.push('</ol>');
          inOl = false;
        }
        if (inBlockquote) {
          out.push('</blockquote>');
          inBlockquote = false;
        }
        out.push(trimmed);
        continue;
      }

      if (trimmed.startsWith('<blockquote')) {
        if (!inBlockquote) out.push('<blockquote>');
        out.push(trimmed.replace(/^<blockquote[^>]*>/, ''));
        inBlockquote = true;
        continue;
      }

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c: string) => c.trim());
        if (!cells.some((c: string) => /^-+$/.test(c))) {
          tableRows.push('<tr>' + cells.map((c: string) => `<td>${c}</td>`).join('') + '</tr>');
        }
        continue;
      } else if (inTable) {
        out.push('<table>' + tableRows.join('') + '</table>');
        tableRows = [];
        inTable = false;
      }

      if (/^(\d+\.|-)\s/.test(trimmed)) {
        const isOrdered = /^\d+\./.test(trimmed);
        const text = trimmed.replace(/^(\d+\.|-)\s/, '');
        if (isOrdered) {
          if (!inOl) out.push('<ol>');
          inOl = true;
        } else {
          if (!inUl) out.push('<ul>');
          inUl = true;
        }
        out.push(`<li>${text}</li>`);
        continue;
      }

      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
      if (inBlockquote) {
        out.push(trimmed + '</blockquote>');
        inBlockquote = false;
      } else out.push(`<p>${trimmed}</p>`);
    }

    if (inUl) out.push('</ul>');
    if (inOl) out.push('</ol>');
    if (inBlockquote) out.push('</blockquote>');
    if (inTable) out.push('<table>' + tableRows.join('') + '</table>');

    const html = out.join('\n');

    return { html, toc };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private escape(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
