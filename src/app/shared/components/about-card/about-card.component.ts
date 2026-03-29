import { Component } from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';

@Component({
  selector: 'app-about-card',
  standalone: true,
  template: `
    <div class="about-card">
      <h2>About This Blog</h2>
      <p class="about-text">
        Welcome to my personal corner of the internet—a space dedicated to sharing 
        stories, experiences, and creative projects that matter.
      </p>
      <p class="about-text">
        Here you'll find travel adventures, lifestyle insights, creative endeavors, 
        and reflections on living intentionally. This blog is a collection of moments 
        captured through words and images, inspired by the beauty of everyday life.
      </p>
      <p class="about-text highlight">
        {{ tagline }}
      </p>
    </div>
  `,
  styles: [
    `
    :host {
      display: block;
    }

    .about-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      margin-bottom: 20px;
    }

    @media (max-width: 640px) {
      .about-card {
        padding: 20px;
        border-radius: 12px;
      }
    }

    .about-card h2 {
      margin: 0 0 20px;
      font-size: 1.1rem;
      font-weight: 600;
      padding-bottom: 16px;
      border-bottom: 1px solid #30363d;
      letter-spacing: -0.3px;
      color: #e6edf3;
    }

    .about-text {
      color: #c9d1d9;
      line-height: 1.7;
      font-size: 0.95rem;
      margin: 0 0 16px;
      text-align: left;
    }

    .about-text:last-of-type {
      margin-bottom: 0;
    }

    .about-text.highlight {
      background: rgba(88, 166, 255, 0.1);
      border-left: 3px solid #58a6ff;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-weight: 500;
      color: #e6edf3;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .about-card {
        padding: 20px;
      }

      .about-text {
        font-size: 0.9rem;
      }
    }
  `,
  ],
})
export class AboutCardComponent {
  readonly siteName = SITE_CONFIG.site.name;
  readonly tagline = `Sharing stories from ${SITE_CONFIG.author.location} 🌍 | Connecting with souls worldwide 🌟`;
}
