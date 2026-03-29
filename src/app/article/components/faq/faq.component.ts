import { Component, signal, inject } from '@angular/core';
import { TablerIconComponent } from '../../../shared/components/tabler-icon/tabler-icon.component';
import { AppContentService, type FAQItem } from '../../../shared/services/app-content.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [TablerIconComponent],
  template: `
    <div class="card">
      <h2>FAQ</h2>
      @for (faq of faqs; track faq.question; let i = $index) {
        <div class="faq-item">
          <button class="faq-btn" (click)="toggleFaq(i)" [class.active]="openFaq() === i">
            {{ faq.question }}
            <tabler-icon [name]="openFaq() === i ? 'minus' : 'plus'" [size]="18" />
          </button>
          @if (openFaq() === i) {
            <div class="faq-answer" [innerHTML]="faq.answer"></div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
    :host {
      display: block;
    }

    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      margin-bottom: 20px;
    }

    @media (max-width: 640px) {
      .card {
        padding: 20px;
        border-radius: 12px;
      }
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

    .faq-item {
      margin-bottom: 12px;
      border: 1px solid #30363d;
      border-radius: 10px;
      overflow: hidden;
    }

    .faq-btn {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 16px;
      background: #21262d;
      border: none;
      color: #e6edf3;
      cursor: pointer;
      text-align: left;
      font-size: 0.95rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .faq-btn:hover {
      background: #30363d;
    }

    .faq-btn.active {
      background: #1f6feb;
      color: #fff;
    }

    .faq-answer {
      padding: 16px;
      background: #0d1117;
      color: #c9d1d9;
      line-height: 1.7;
      font-size: 0.95rem;
    }

    .faq-answer :global(p) {
      margin: 0;
    }

    .faq-answer :global(strong) {
      color: #e6edf3;
    }

    .faq-answer :global(code) {
      background: rgba(110,118,129,0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 0.875em;
      color: #e6edf3;
    }
  `,
  ],
})
export class FaqComponent {
  private readonly contentService = inject(AppContentService);
  readonly openFaq = signal<number | null>(null);
  readonly faqs: FAQItem[] = this.contentService.getFAQs();

  toggleFaq(index: number) {
    this.openFaq.update((current) => (current === index ? null : index));
  }
}
