import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolsComponent } from '../shared/components/devtools/devtools.component';
import { AppContentService, type DemoCard } from '../shared/services/app-content.service';

interface OpenWindow {
  id: string;
  title: string;
  icon: string;
  color: string;
  instance: any;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DevToolsComponent],
  template: `
<div class="app-header">
  <div class="app-title">
    <span class="app-icon">🗂️</span>
    <span>App Demo</span>
  </div>
  <div class="header-right">
    <span class="window-count">{{ openWindows.length }} window{{ openWindows.length === 1 ? '' : 's' }} open</span>
    @if (openWindows.length > 0) {
      <button class="close-all-btn" (click)="closeAllWindows()">Close All</button>
    }
  </div>
</div>

<div class="tab-bar">
  <div class="tab home-tab" (click)="minimizeAllWindows()">
    <span class="tab-icon">🏠</span>
    <span class="tab-title">Home</span>
  </div>
  @for (win of openWindows; track win.id) {
    <div
      class="tab"
      [class.active]="activeWindowId === win.id"
      [style.--tab-color]="win.color"
      (click)="focusWindow(win)"
    >
      <span class="tab-icon">{{ win.icon }}</span>
      <span class="tab-title">{{ win.title }}</span>
      <button class="tab-close" (click)="closeWindow(win, $event)">×</button>
    </div>
  }
</div>

<div class="demo-container">
  <h1>Explore My World</h1>
  <p class="subtitle">Discover stories, experiences, and creative projects</p>

  <div class="search-container">
    <input
      type="text"
      class="search-input"
      placeholder="Search topics..."
      [value]="searchQuery"
      (input)="searchQuery = $any($event.target).value"
    />
    <span class="search-icon">🔍</span>
    @if (searchQuery) {
      <button type="button" class="clear-btn" (click)="searchQuery = ''">×</button>
    }
  </div>

  <div class="cards-grid">
    @for (card of filteredCards; track card.title) {
      <div class="card" (click)="openCard(card)">
        <div class="card-icon" [style.background]="card.color">
          {{ card.icon }}
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-description">{{ card.description }}</p>
        </div>
      </div>
    } @empty {
      <div class="no-results">
        <p>No results found for "{{ searchQuery }}"</p>
      </div>
    }
  </div>
</div>

<!-- DevTools -->
<app-devtools />
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      background: #0d1117;
      color: #e6edf3;
      overflow: hidden;
    }
    .app-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 32px;
      background: #010409;
      border-bottom: 1px solid #30363d;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 1001;
    }
    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
    }
    .app-icon {
      font-size: 16px;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .window-count {
      font-size: 12px;
      color: #8b949e;
    }
    .close-all-btn {
      background: #da3633;
      color: #fff;
      border: none;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .close-all-btn:hover {
      background: #f85149;
    }
    .tab-bar {
      position: fixed;
      top: 32px;
      left: 0;
      right: 0;
      height: 40px;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      display: flex;
      align-items: center;
      padding: 0 8px;
      gap: 4px;
      z-index: 1000;
      overflow-x: auto;
    }
    .home-tab {
      background: #21262d;
      border: 1px solid #30363d;
    }
    .home-tab:hover {
      background: #30363d;
      color: #e6edf3;
    }
    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #21262d;
      border-radius: 6px 6px 0 0;
      cursor: pointer;
      font-size: 13px;
      color: #8b949e;
      border: 1px solid transparent;
      border-bottom: none;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .tab:hover {
      background: #30363d;
      color: #e6edf3;
    }
    .tab.active {
      background: var(--tab-color, #58a6ff);
      color: #fff;
      border-color: var(--tab-color, #58a6ff);
    }
    .tab-icon {
      font-size: 14px;
    }
    .tab-title {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tab-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 16px;
      cursor: pointer;
      padding: 0 0 0 4px;
      line-height: 1;
      opacity: 0.6;
    }
    .tab-close:hover {
      opacity: 1;
    }
    .demo-container {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 120px 32px 200px;
      height: calc(100vh - 72px);
      overflow-y: auto;
      scroll-behavior: smooth;
      box-sizing: border-box;
    }
    .demo-container::-webkit-scrollbar {
      width: 8px;
    }
    .demo-container::-webkit-scrollbar-track {
      background: #0d1117;
    }
    .demo-container::-webkit-scrollbar-thumb {
      background: #30363d;
      border-radius: 4px;
    }
    .demo-container::-webkit-scrollbar-thumb:hover {
      background: #484f58;
    }
    .demo-container h1 {
      font-size: 2rem;
      color: #e6edf3;
      margin-bottom: 8px;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      color: #8b949e;
      margin-bottom: 32px;
    }
    .search-container {
      position: relative;
      max-width: 600px;
      margin: 0 auto 40px;
      background: transparent;
      padding: 0;
    }
    .search-input {
      width: 100%;
      padding: 14px 45px 14px 20px;
      font-size: 1rem;
      border: 2px solid #30363d;
      border-radius: 12px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
      background: #161b22;
      color: #e6edf3;
    }
    .search-input:focus {
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }
    .search-icon {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.2rem;
      opacity: 0.5;
    }
    .clear-btn {
      position: absolute;
      right: 45px;
      top: 50%;
      transform: translateY(-50%);
      background: #30363d;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      color: #8b949e;
      transition: background 0.2s;
    }
    .clear-btn:hover {
      background: #484f58;
    }
    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      margin: 0;
    }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 24px 32px;
      transition: box-shadow 0.2s, border-color 0.2s;
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 24px;
      min-height: 120px;
      will-change: auto;
      backface-visibility: hidden;
      width: 100%;
      box-sizing: border-box;
      max-width: 100%;
    }
    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      border-color: #58a6ff;
    }
    .card:active {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .card-content {
      flex: 1;
      min-width: 0;
      width: 100%;
    }
    .card-title {
      font-size: 1.1rem;
      color: #e6edf3;
      margin: 0 0 8px;
      font-weight: 600;
    }
    .card-description {
      color: #8b949e;
      line-height: 1.6;
      margin: 0;
      font-size: 0.9rem;
    }
    .click-hint {
      font-size: 0.75rem;
      color: #58a6ff;
      opacity: 0.8;
      white-space: nowrap;
      margin-left: 12px;
    }
    .no-results {
      width: 100%;
      text-align: center;
      padding: 60px 20px;
      color: #8b949e;
    }
    @media (max-width: 768px) {
      .demo-container {
        padding: 100px 20px 150px;
      }
      .demo-container h1 {
        font-size: 1.5rem;
      }
      .cards-grid {
        padding: 0;
      }
      .card {
        padding: 20px 20px;
        gap: 16px;
        min-height: 100px;
      }
      .card-icon {
        width: 42px;
        height: 42px;
        font-size: 1.25rem;
      }
      .card-title {
        font-size: 1rem;
      }
      .card-description {
        font-size: 0.85rem;
      }
      .click-hint {
        display: none;
      }
    }
  `],
})
export class DemoComponent {
  private readonly contentService = inject(AppContentService);
  searchQuery = '';
  openWindows: OpenWindow[] = [];
  activeWindowId = '';

  readonly cards: DemoCard[] = this.contentService.getDemoCards();

  get filteredCards(): DemoCard[] {
    if (!this.searchQuery.trim()) {
      return this.cards;
    }

    const query = this.searchQuery.toLowerCase().trim();
    return this.cards.filter(
      (card) =>
        card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query)
    );
  }

  openCard(card: DemoCard): void {
    const WinBoxConstructor = (window as unknown as { WinBox: any }).WinBox;
    if (!WinBoxConstructor) {
      console.error('WinBox is not loaded. Please check if winbox.bundle.min.js is included.');
      return;
    }

    const existingWindow = this.openWindows.find(w => w.title === card.title);
    if (existingWindow) {
      this.focusWindow(existingWindow);
      return;
    }

    const windowId = card.title.toLowerCase().replace(/\s+/g, '-');
    const _win = new WinBoxConstructor({
      title: card.title,
      background: card.color,
      x: 0,
      y: 72,
      width: window.innerWidth,
      height: window.innerHeight - 72,
      mount: null,
      show: false,
      border: 0,
      html: `
        <div style="padding: 20px; color: #e6edf3; height: 100%; overflow: auto; background: #161b22;">
          ${card.content}
          ${
            card.link
              ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #30363d;">
            <a href="${card.link}" target="_blank" style="color: ${card.color}; text-decoration: none; font-weight: 500;">
              Visit ${card.title} Website →
            </a>
          </div>
        `
              : ''
          }
        </div>
      `,
      onfocus: () => {
        this.activeWindowId = windowId;
      },
      onclose: () => {
        this.removeWindow(windowId);
        return true;
      },
    });

    _win.min = function() {
      this.hide();
    };

    const openWindow: OpenWindow = {
      id: windowId,
      title: card.title,
      icon: card.icon,
      color: card.color,
      instance: _win,
    };

    this.openWindows = [...this.openWindows, openWindow];
    this.activeWindowId = windowId;
    console.log(`[WinBox] Open window: ${card.title} (${windowId})`);
    this.emitWindowChange();
    _win.show();
  }

  focusWindow(win: OpenWindow): void {
    console.log(`[WinBox] Focus window: ${win.title} (${win.id})`);
    this.activeWindowId = win.id;
    win.instance.show();
    win.instance.focus();
    this.emitWindowChange();
  }

  closeWindow(win: OpenWindow, event: Event): void {
    event.stopPropagation();
    console.log(`[WinBox] Close window: ${win.title} (${win.id})`);
    win.instance.close();
    this.removeWindow(win.id);
    this.emitWindowChange();
  }

  minimizeAllWindows(): void {
    console.log(`[WinBox] Minimize all windows (${this.openWindows.length} open)`);
    for (const win of this.openWindows) {
      win.instance.hide();
    }
    this.activeWindowId = '';
    this.emitWindowChange();
  }

  closeAllWindows(): void {
    console.log(`[WinBox] Close all windows (${this.openWindows.length} open)`);
    for (const win of this.openWindows) {
      win.instance.hide();
      win.instance.close();
    }
    this.openWindows = [];
    this.activeWindowId = '';
    this.emitWindowChange();
  }

  private removeWindow(id: string): void {
    this.openWindows = this.openWindows.filter(w => w.id !== id);
    if (this.activeWindowId === id) {
      const remaining = this.openWindows;
      this.activeWindowId = remaining.length > 0 ? remaining[remaining.length - 1].id : '';
    }
    this.emitWindowChange();
  }

  private emitWindowChange(): void {
    const activeWin = this.openWindows.find(w => w.id === this.activeWindowId);
    window.dispatchEvent(new CustomEvent('winbox-change', {
      detail: {
        count: this.openWindows.length,
        active: activeWin?.title || 'None',
      },
    }));
  }
}
