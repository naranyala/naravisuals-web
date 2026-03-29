import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../tabler-icon/tabler-icon.component';
import { SITE_CONFIG } from '../../config/site.config';

interface PublicLink {
  title: string;
  url: string;
}

@Component({
  selector: 'app-public-links',
  standalone: true,
  imports: [CommonModule, TablerIconComponent],
  template: `
    @if (isEnabled) {
      <div class="public-links-card">
        <h2>Public Links</h2>
        <p class="card-description">
          Access my curated collection of resources, templates, and shared files.
        </p>

        <div class="links-list">
          @for (link of publicLinks; track link.title) {
            <a
              [href]="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="link-item">
              <div class="link-content">
                <h3 class="link-title">{{ link.title }}</h3>
              </div>
              <tabler-icon name="externalLink" [size]="18" class="link-arrow" />
            </a>
          }
        </div>

        <p class="card-note">
          <tabler-icon name="infoCircle" [size]="16" />
          All links open in a new tab. Files are hosted on Google Drive.
        </p>
      </div>
    }
  `,
  styles: [
    `
    :host {
      display: block;
    }

    .public-links-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      margin-bottom: 20px;
    }

    @media (max-width: 640px) {
      .public-links-card {
        padding: 20px;
        border-radius: 12px;
      }
    }

    .public-links-card h2 {
      margin: 0 0 12px;
      font-size: 1.1rem;
      font-weight: 600;
      padding-bottom: 16px;
      border-bottom: 1px solid #30363d;
      letter-spacing: -0.3px;
      color: #e6edf3;
    }

    .card-description {
      color: #8b949e;
      font-size: 0.9rem;
      margin: 0 0 20px;
      line-height: 1.6;
    }

    .links-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .link-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .link-item:hover {
      background: #30363d;
      border-color: #58a6ff;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .link-content {
      flex: 1;
      min-width: 0;
    }

    .link-title {
      color: #e6edf3;
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0;
    }

    .link-arrow {
      color: #484f58;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .link-item:hover .link-arrow {
      color: #58a6ff;
      transform: translateX(2px);
    }

    .card-note {
      margin-top: 20px;
      padding: 12px 16px;
      background: rgba(88, 166, 255, 0.1);
      border-left: 3px solid #58a6ff;
      border-radius: 0 8px 8px 0;
      font-size: 0.85rem;
      color: #8b949e;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-note tabler-icon {
      flex-shrink: 0;
      color: #58a6ff;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .public-links-card {
        padding: 20px;
      }

      .link-item {
        padding: 12px;
      }

      .link-icon {
        width: 40px;
        height: 40px;
      }

      .link-title {
        font-size: 0.9rem;
      }

      .link-description {
        font-size: 0.8rem;
      }
    }
  `,
  ],
})
export class PublicLinksComponent {
  readonly isEnabled = SITE_CONFIG.publicLinks.enabled;
  readonly publicLinks: PublicLink[] = SITE_CONFIG.publicLinks.links;
}
