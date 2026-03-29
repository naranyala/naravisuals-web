import { Component, inject, type OnInit, signal } from '@angular/core';
import {
  ArticleListComponent,
  ArticleReaderComponent,
  FaqComponent,
  SocialLinksComponent,
  AboutCardComponent,
  PublicLinksComponent,
} from './article/components';
import { type Article, ArticleService } from './services/article.service';
import { SITE_CONFIG } from './shared/config/site.config';

/**
 * Main App Component
 *
 * This is the root component that orchestrates the article reading experience.
 * It has been refactored from a monolithic 1400+ line component into smaller,
 * focused components:
 *
 * - FaqComponent: FAQ section with expandable items
 * - ArticleListComponent: List of available articles
 * - ArticleReaderComponent: Full-screen article reader with TOC
 * - SocialLinksComponent: Social media links card
 *
 * Features:
 * - Clean, centered layout
 * - Text-only footer with copyright and links
 * - Responsive two-column design
 * - Dark theme optimized for reading
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FaqComponent, ArticleListComponent, ArticleReaderComponent, SocialLinksComponent, AboutCardComponent, PublicLinksComponent],
  template: `
    <div class="development-banner">
      <div class="banner-content">
        <span class="banner-icon">⚠️</span>
        <span class="banner-text">This site is currently under development — More content coming soon!</span>
        <span class="banner-icon">⚠️</span>
      </div>
    </div>

    <div class="container">
      <section class="columns">
        <div class="column">
          <app-about-card />
          <app-social-links />
          <app-faq />
        </div>

        <div class="column">
          @if (isLoading()) {
            <div class="card">
              <h2>Loading Articles...</h2>
              <p class="loading">Please wait while we fetch the articles.</p>
            </div>
          } @else if (loadingError()) {
            <div class="card">
              <h2 style="color: #f85149;">Error Loading Articles</h2>
              <div class="error-message">
                <p>{{ loadingError() }}</p>
                <button class="retry-btn" (click)="loadArticles()">
                  <span>🔄</span> Retry
                </button>
              </div>
            </div>
          } @else if (selectedArticle()) {
            <app-article-reader
              [article]="selectedArticle()"
              (back)="onArticleBack()">
            </app-article-reader>
          } @else {
            <app-article-list
              [articles]="articles()"
              [isLoading]="isLoading()"
              (articleSelected)="onArticleSelected($event)">
            </app-article-list>
          }
          
          <app-public-links />
        </div>
      </section>

      <footer class="footer">
        <p class="footer-text">© {{ currentYear }} {{ authorName }}. All rights reserved.</p>
        <p class="footer-text">Sharing stories, experiences, and creative projects from around the world.</p>
        <p class="footer-links">
          <a [href]="'mailto:' + contactEmail" class="footer-link">Email</a>
          <span class="footer-divider">•</span>
          <a href="#privacy" class="footer-link">Privacy</a>
          <span class="footer-divider">•</span>
          <a href="#terms" class="footer-link">Terms</a>
        </p>
      </footer>
    </div>
  `,
  styles: [
    `
    :host {
      display: block;
      background: #0d1117;
      color: #e6edf3;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      line-height: 1.6;
    }

    /* ===== DEVELOPMENT BANNER ===== */
    .development-banner {
      background: linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%);
      border-bottom: 2px solid #dc2626;
      padding: 12px 40px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
    }

    @media (max-width: 1200px) {
      .development-banner {
        padding: 12px 32px;
      }
    }

    @media (max-width: 900px) {
      .development-banner {
        padding: 12px 24px;
      }
    }

    @media (max-width: 640px) {
      .development-banner {
        padding: 10px 20px;
        margin-bottom: 16px;
      }

      .banner-text {
        font-size: 0.8rem;
      }

      .banner-icon {
        font-size: 1rem;
      }
    }

    .banner-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      white-space: nowrap;
    }

    .banner-text {
      color: #fecaca;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
    }

    .banner-icon {
      font-size: 1.2rem;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.1);
      }
    }

    /* ===== LAYOUT ===== */
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px 40px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .columns {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 48px;
      flex: 1;
    }

    @media (max-width: 1200px) {
      .container {
        padding: 20px 32px;
      }
      
      .columns {
        gap: 40px;
      }
    }

    @media (max-width: 900px) {
      .columns {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      
      .container {
        padding: 16px 24px;
      }
    }

    @media (max-width: 640px) {
      .container {
        padding: 12px 20px;
      }
      
      .columns {
        gap: 24px;
      }
    }

    .column {
      min-width: 0;
    }

    /* ===== FOOTER ===== */
    .footer {
      text-align: center;
      padding: 40px 60px 30px;
      margin-top: 60px;
      border-top: 1px solid #30363d;
    }

    @media (max-width: 1200px) {
      .footer {
        padding: 40px 48px 30px;
      }
    }

    @media (max-width: 900px) {
      .footer {
        padding: 32px 32px 24px;
        margin-top: 48px;
      }
    }

    @media (max-width: 640px) {
      .footer {
        padding: 24px 20px 20px;
        margin-top: 40px;
      }
    }

    .footer-text {
      color: #8b949e;
      margin: 8px 0;
      font-size: 0.9rem;
    }

    .footer-text:first-of-type {
      font-weight: 500;
      color: #e6edf3;
    }

    .footer-links {
      margin-top: 16px;
      font-size: 0.85rem;
    }

    .footer-link {
      color: #8b949e;
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-link:hover {
      color: #58a6ff;
      text-decoration: underline;
    }

    .footer-divider {
      color: #30363d;
      margin: 0 8px;
    }

    /* ===== CARDS ===== */
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .card h2 {
      margin: 0 0 20px;
      font-size: 1.1rem;
      font-weight: 600;
      padding-bottom: 16px;
      border-bottom: 1px solid #30363d;
      letter-spacing: -0.3px;
      color: #e6edf3;
    }

    /* ===== LOADING & ERRORS ===== */
    .loading {
      color: #8b949e;
      text-align: center;
      padding: 40px;
    }

    .error-message {
      padding: 20px;
      background: rgba(248,81,73,0.1);
      border: 1px solid #f85149;
      border-radius: 8px;
      margin-top: 16px;
    }

    .error-message p {
      color: #e6edf3;
      margin: 0 0 16px;
      line-height: 1.6;
    }

    .retry-btn {
      background: linear-gradient(135deg, #1f6feb 0%, #1960c7 100%);
      border: 1px solid #388bfd;
      color: #fff;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .retry-btn:hover {
      background: linear-gradient(135deg, #388bfd 0%, #1f6feb 100%);
      border-color: #58a6ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(31, 111, 235, 0.3);
    }

    .retry-btn:active {
      transform: translateY(0);
    }
  `,
  ],
})
export class AppComponent implements OnInit {
  private articleService = inject(ArticleService);

  // Configuration from site config
  readonly currentYear = SITE_CONFIG.copyright.year;
  readonly authorName = SITE_CONFIG.author.name;
  readonly contactEmail = SITE_CONFIG.author.email;
  readonly siteName = SITE_CONFIG.site.name;

  // ===== CONFIGURATION =====
  readonly ENABLE_CODE_HIGHLIGHTING = true; // Set to true to enable Shiki syntax highlighting
  // =========================

  // State
  readonly articles = signal<Article[]>([]);
  readonly selectedArticle = signal<Article | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly loadingError = signal<string | null>(null);

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    console.log('[AppComponent] Loading articles...');
    this.isLoading.set(true);
    this.loadingError.set(null);

    this.articleService.getArticles().subscribe({
      next: (articles) => {
        console.log(`[AppComponent] Loaded ${articles.length} articles`);
        this.articles.set(articles);
        this.isLoading.set(false);

        // Don't auto-select - user must click to open an article
      },
      error: (err) => {
        console.error('[AppComponent] Failed to load articles:', err);
        this.isLoading.set(false);
        this.loadingError.set(this.getErrorMessage(err));
        this.articles.set([]);
      },
      complete: () => {
        console.log('[AppComponent] Article loading complete');
      },
    });
  }

  onArticleSelected(article: Article) {
    console.log('[AppComponent] Article selected:', article.title);
    this.selectedArticle.set(article);
  }

  onArticleBack() {
    console.log('[AppComponent] Back from article');
    this.selectedArticle.set(null);
  }

  private getErrorMessage(error: any): string {
    if (error?.message?.includes('404')) {
      return 'Article files not found. Please ensure the /docs folder exists and contains .md files.';
    }
    if (error?.message?.includes('connect') || error?.status === 0) {
      return 'Cannot connect to server. Please ensure the dev server is running.';
    }
    if (error?.message) {
      return `Failed to load articles: ${error.message}`;
    }
    return 'An unexpected error occurred while loading articles.';
  }
}
