import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { type Card, CardListComponent } from '../components/card-list/card-list.component';

interface CodeExample {
  filename: string;
  code: string;
  language?: string;
}

interface CardItem extends Card {
  features: string[];
  codeExamples?: CodeExample[];
}

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
  imports: [CommonModule, CardListComponent],
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
  <h1>Technology Cards</h1>
  <p class="subtitle">Explore the technologies powering this demo</p>
  
  <app-card-list [cards]="cards" (cardClick)="openCard($event)" />
</div>
  `,
  styles: [
    `
    :host {
      display: block;
      min-height: 100vh;
      background: #0d1117;
      color: #e6edf3;
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
      max-width: 1000px;
      margin: 0 auto;
      padding: 92px 20px 40px;
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
      max-width: 500px;
      margin: 0 auto 40px;
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
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 16px 20px;
      transition: transform 0.2s, box-shadow 0.2s, cursor 0.2s;
      animation: fadeIn 0.3s ease-out;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-color: #58a6ff;
    }
    .card:active {
      transform: translateY(-1px);
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .card-content {
      flex: 1;
      min-width: 0;
    }
    .card-title {
      font-size: 1rem;
      color: #e6edf3;
      margin: 0 0 4px;
    }
    .card-description {
      color: #8b949e;
      line-height: 1.4;
      margin: 0;
      font-size: 0.85rem;
    }
    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #8b949e;
    }
    @media (max-width: 600px) {
      .demo-container h1 {
        font-size: 1.5rem;
      }
    }
  `,
  ],
})
export class DemoComponent {
  openWindows: OpenWindow[] = [];
  activeWindowId = '';

  cards: CardItem[] = [
    {
      title: 'Angular',
      description:
        'A platform for building mobile and desktop web applications with TypeScript and component-based architecture.',
      icon: '🅰️',
      color: '#e535ab',
      content: 'Angular is a development platform, built on TypeScript.',
      link: 'https://angular.dev',
      features: [
        'Component-based architecture for scalable apps',
        'Built-in routing, forms, and HTTP client',
        'Dependency injection system',
        'Standalone components (Angular 14+)',
        'Signals for reactive state management',
      ],
      codeExamples: [
        {
          filename: 'app.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-root',
  standalone: true,
  template: \`
    <h1>Hello {{ name }}!</h1>
    <button (click)="greet()">Greet</button>
  \`
})
export class AppComponent {
  name = 'Angular';

  greet() {
    console.log('Hello!');
  }
}`,
        },
        {
          filename: 'signals.service.ts',
          language: 'typescript',
          code: `@Injectable({ providedIn: 'root' })
export class CounterService {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}`,
        },
      ],
    },
    {
      title: 'Rspack',
      description:
        'A high-performance JavaScript bundler written in Rust. Offers faster builds than traditional bundlers.',
      icon: '⚡',
      color: '#f5a623',
      content: 'Rspack is a high performance JavaScript bundler written in Rust.',
      link: 'https://rspack.dev',
      features: [
        'Lightning fast cold starts',
        'Incremental compilation',
        'Built-in loaders and plugins',
        'Webpack compatibility',
        'Hot Module Replacement (HMR)',
      ],
      codeExamples: [
        {
          filename: 'rspack.config.js',
          language: 'javascript',
          code: `module.exports = {
  entry: './src/index.ts',
  output: {
    path: './dist',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};`,
        },
      ],
    },
    {
      title: 'Bun',
      description:
        'An all-in-one JavaScript runtime, package manager, and build tool. A faster alternative to Node.js.',
      icon: '🥟',
      color: '#fbf0df',
      content: 'Bun is an all-in-one toolkit for JavaScript and TypeScript apps.',
      link: 'https://bun.sh',
      features: [
        'JavaScript runtime built on JavaScriptCore',
        'Drop-in npm replacement',
        'Fast bundler for JS/TS',
        'Jest-compatible test runner',
        'Native TypeScript support',
      ],
      codeExamples: [
        {
          filename: 'server.ts',
          language: 'typescript',
          code: `const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello Bun!");
  }
});

console.log(\`Server running on \${server.url}\`);`,
        },
        {
          filename: 'bun install',
          language: 'bash',
          code: `# Install dependencies
bun install

# Run scripts
bun run dev

# Run tests
bun test`,
        },
      ],
    },
    {
      title: 'TypeScript',
      description:
        'A typed superset of JavaScript that compiles to plain JavaScript. Adds static types to the language.',
      icon: '📘',
      color: '#3178c6',
      content: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
      link: 'https://typescriptlang.org',
      features: [
        'Static type checking',
        'Enhanced IDE support',
        'Modern JavaScript features',
        'Interfaces and generics',
        'Compiles to clean JavaScript',
      ],
      codeExamples: [
        {
          filename: 'interfaces.ts',
          language: 'typescript',
          code: `interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

function getUser(id: number): Promise<User> {
  return fetch(\`/api/users/\${id}\`)
    .then(res => res.json());
}

type PartialUser = Partial<User>;`,
        },
        {
          filename: 'generics.ts',
          language: 'typescript',
          code: `function identity<T>(arg: T): T {
  return arg;
}

interface Repository<T> {
  findById(id: string): Promise<T>;
  save(item: T): Promise<void>;
}

class UserRepository implements Repository<User> {
  async findById(id: string) { /* ... */ }
  async save(user: User) { /* ... */ }
}`,
        },
      ],
    },
    {
      title: 'esbuild',
      description:
        'An extremely fast JavaScript bundler and minifier. Used here for compiling TypeScript.',
      icon: '🚀',
      color: '#ffcf00',
      content: 'esbuild is an extremely fast JavaScript bundler and minifier.',
      link: 'https://esbuild.github.io',
      features: [
        '10-100x faster than other bundlers',
        'Written in Go',
        'Native TypeScript support',
        'JSX support out of the box',
        'Minification and tree shaking',
      ],
      codeExamples: [
        {
          filename: 'build.js',
          language: 'javascript',
          code: `const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  minify: true,
  sourcemap: true,
  target: ['es2020'],
}).then(() => {
  console.log('Build complete!');
});`,
        },
        {
          filename: 'CLI',
          language: 'bash',
          code: `# Bundle with minification
esbuild app.js --bundle --minify --outfile=dist.js

# Watch mode
esbuild app.js --bundle --watch --outfile=dist.js

# TypeScript + JSX
esbuild app.tsx --bundle --loader:.tsx=tsx --outfile=dist.js`,
        },
      ],
    },
    {
      title: 'HMR',
      description:
        'Hot Module Replacement enables instant updates during development without page refresh.',
      icon: '🔥',
      color: '#ff6b6b',
      content: 'HMR exchanges, adds, or removes modules while an application is running.',
      features: [
        'Preserve application state',
        'Instant feedback on changes',
        'No full page reload',
        'Faster development cycle',
        'Works with frameworks & custom code',
      ],
      codeExamples: [
        {
          filename: 'hmr-example.js',
          language: 'javascript',
          code: `// Module with HMR support
const { hot } = module;

if (hot) {
  hot.accept('./reporter', (newReporter) => {
    // Update when module changes
    newReporter.report();
  });
}

// Component re-renders without state loss
function Counter() {
  const [count, setCount] = useState(0);
  // State preserved on hot reload!
  return <button onClick={() => setCount(c => c+1)}>{count}</button>;
}`,
        },
      ],
    },
  ];
  description: 'Hot Module Replacement enables instant updates during development without page refresh.';
  ,
  icon: '🔥';
  ,
  color: '#ff6b6b';
  ,
  content: `
        <h2>Hot Module Replacement</h2>
        <p>HMR exchanges, adds, or removes modules while an application is running:</p>
        <ul>
          <li>Preserve application state</li>
          <li>Instant feedback on changes</li>
          <li>No full page reload</li>
          <li>Faster development cycle</li>
        </ul>
        <p><strong>Supported by:</strong> Angular, Vite, Webpack, Rspack</p>
      `;
  ,
}
,
  ]

openCard(card: Card)
: void
{
  const WinBoxConstructor = (window as unknown as { WinBox: any }).WinBox;
  if (!WinBoxConstructor) {
    console.error('WinBox is not loaded. Please check if winbox.bundle.min.js is included.');
    return;
  }

  const existingWindow = this.openWindows.find((w) => w.title === card.title);
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

  _win.min = function () {
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
  _win.show();
}

focusWindow(win: OpenWindow)
: void
{
  console.log(`[WinBox] Focus window: ${win.title} (${win.id})`);
  this.activeWindowId = win.id;
  win.instance.show();
  win.instance.focus();
}

closeWindow(win: OpenWindow, event: Event)
: void
{
  event.stopPropagation();
  console.log(`[WinBox] Close window: ${win.title} (${win.id})`);
  win.instance.close();
  this.removeWindow(win.id);
}

minimizeAllWindows();
: void
{
  console.log(`[WinBox] Minimize all windows (${this.openWindows.length} open)`);
  for (const win of this.openWindows) {
    win.instance.hide();
  }
  this.activeWindowId = '';
}

closeAllWindows();
: void
{
  console.log(`[WinBox] Close all windows (${this.openWindows.length} open)`);
  for (const win of this.openWindows) {
    win.instance.hide();
    win.instance.close();
  }
  this.openWindows = [];
  this.activeWindowId = '';
}

private
removeWindow(id: string)
: void
{
  this.openWindows = this.openWindows.filter((w) => w.id !== id);
  if (this.activeWindowId === id) {
    const remaining = this.openWindows;
    this.activeWindowId = remaining.length > 0 ? remaining[remaining.length - 1].id : '';
  }
}
}
