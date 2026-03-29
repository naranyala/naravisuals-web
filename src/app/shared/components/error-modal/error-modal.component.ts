import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ErrorModalService, type ErrorInfo } from '../../services/error-handler.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  template: `
    @if (currentError) {
      <div class="error-modal-backdrop" (click)="onBackdropClick($event)">
        <div class="error-modal" role="alertdialog" aria-modal="true">
          <div class="error-modal-header">
            <div class="error-modal-title">
              <span class="error-icon">⚠️</span>
              <span>Application Error</span>
            </div>
            <button
              type="button"
              class="error-modal-close"
              (click)="close()"
              aria-label="Close error dialog"
            >
              ✕
            </button>
          </div>

          <div class="error-modal-body">
            <div class="error-message-section">
              <label class="error-label">Error Message</label>
              <div class="error-message">{{ currentError.message }}</div>
            </div>
          </div>

          <div class="error-modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="close()"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .error-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }

    .error-modal {
      background: var(--bg-elevated);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-color);
    }

    .error-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);
      border-bottom: 1px solid var(--border-color);
    }

    .error-modal-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 1.1rem;
      color: var(--text-primary);
    }

    .error-icon {
      font-size: 1.4rem;
    }

    .error-modal-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      cursor: pointer;
      font-size: 1.2rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-fast);
    }

    .error-modal-close:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .error-modal-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .error-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .error-message-section {
      margin-bottom: 16px;
    }

    .error-message {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--text-primary);
      font-size: 0.95rem;
      line-height: 1.5;
      word-break: break-word;
    }

    .error-modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 20px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: none;
    }

    .btn-secondary {
      background: var(--neutral-600);
      color: var(--text-primary);
    }

    .btn-secondary:hover {
      background: var(--neutral-500);
    }
  `,
})
export class ErrorModalComponent implements OnInit {
  private readonly errorModalService: ErrorModalService;
  private readonly cdr: ChangeDetectorRef;

  currentError: ErrorInfo | null = null;

  constructor(errorModalService: ErrorModalService, cdr: ChangeDetectorRef) {
    this.errorModalService = errorModalService;
    this.cdr = cdr;
  }

  ngOnInit(): void {
    this.errorModalService.currentError$.subscribe(error => {
      this.currentError = error;
      this.cdr.detectChanges();
    });
  }

  close(): void {
    this.errorModalService.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
