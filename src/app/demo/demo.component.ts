import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { type Card, CardListComponent, type CardCategory } from '../components/card-list/card-list.component';

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

<main class="main-content">
  <div class="demo-container">
    <h1>Angular Components Demo</h1>
    <p class="subtitle">Explore modern Angular component patterns and best practices</p>

    <app-card-list [cards]="cards" (cardClick)="openCard($event)" />
  </div>
</main>
  `,
  styles: [
    `
    :host {
      display: block;
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
    .main-content {
      margin-top: 72px;
      padding-bottom: 40px;
      overflow-y: auto;
      height: calc(100vh - 72px);
    }
    .demo-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
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
  `,
  ],
})
export class DemoComponent {
  openWindows: OpenWindow[] = [];
  activeWindowId = '';

  cards: CardItem[] = [
    // State Management Components
    {
      title: 'Smart Component',
      description:
        'Container component with business logic and state management. Handles data fetching and processing.',
      icon: '🧠',
      color: '#6366f1',
      content: 'Smart components (containers) manage state, business logic, and data operations.',
      link: 'https://angular.dev/guide/components',
      category: 'state',
      features: [
        'Manages application state',
        'Handles HTTP requests',
        'Implements business logic',
        'Passes data to presentational components',
        'Uses services and signals',
      ],
      codeExamples: [
        {
          filename: 'user-list.container.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  templateUrl: './user-list.container.html'
})
export class UserListContainer {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (e) => this.error.set(e.message)
    });
  }

  deleteUser(id: number) {
    this.userService.delete(id).subscribe(() => {
      this.users.update(users =>
        users.filter(u => u.id !== id)
      );
    });
  }
}`,
        },
        {
          filename: 'user-list.container.html',
          language: 'html',
          code: `@if (loading()) {
  <app-spinner />
} @else if (error()) {
  <app-error [message]="error()" />
} @else {
  <app-user-card
    @for (user of users(); track user.id)
    [user]="user"
    (delete)="deleteUser($event)"
  />
}`,
        },
      ],
    },
    {
      title: 'SignalStore',
      description:
        'Lightweight state management using signals. Alternative to NgRx for simpler apps.',
      icon: '📦',
      color: '#8b5cf6',
      content: 'SignalStore provides a simple way to manage state with signals.',
      link: 'https://ngrx.io/guide/signals/signal-store',
      category: 'state',
      features: [
        'Signal-based state',
        'Computed selectors',
        'Side effects with effects',
        'No boilerplate',
        'Tree-shakable',
      ],
      codeExamples: [
        {
          filename: 'auth.store.ts',
          language: 'typescript',
          code: `const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({ user: null, loading: false }),
  withComputed((store) => ({
    isLoggedIn: computed(() => !!store.user()),
  })),
  withMethods((store) => ({
    async login(credentials: Credentials) {
      patchState(store, { loading: true });
      const user = await this.authService.login(credentials);
      patchState(store, { user, loading: false });
    },
    logout() {
      patchState(store, { user: null });
    }
  }))
);`,
        },
      ],
    },
    // UI Components
    {
      title: 'Presentational Component',
      description:
        'Dumb component focused on UI rendering. Receives data via inputs and emits events via outputs.',
      icon: '🎨',
      color: '#ec4899',
      content: 'Presentational components are purely concerned with how things look.',
      link: 'https://angular.dev/guide/components',
      category: 'ui',
      features: [
        'No direct dependencies on services',
        'Uses @Input() and @Output()',
        'Pure UI rendering',
        'Easy to test and reuse',
        'Signal-based inputs supported',
      ],
      codeExamples: [
        {
          filename: 'user-card.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  user = input.required<User>();
  editable = input(false);

  userChange = output<User>();
  delete = output<number>();

  onEdit() {
    this.userChange.emit(this.user());
  }

  onDelete() {
    this.delete.emit(this.user().id);
  }
}`,
        },
        {
          filename: 'user-card.component.html',
          language: 'html',
          code: `<article class="user-card">
  <img [src]="user().avatar" [alt]="user().name" />
  <div class="user-info">
    <h3>{{ user().name }}</h3>
    <p>{{ user().email }}</p>
  </div>
  @if (editable()) {
    <div class="actions">
      <button (click)="onEdit()">Edit</button>
      <button (click)="onDelete()">Delete</button>
    </div>
  }
</article>`,
        },
      ],
    },
    {
      title: 'Functional Component',
      description:
        'Lightweight component using functional patterns. Leverages inject() and signal-based APIs.',
      icon: '⚡',
      color: '#10b981',
      content: 'Functional components use modern Angular patterns for cleaner, simpler code.',
      link: 'https://angular.dev/guide/components',
      category: 'ui',
      features: [
        'Uses inject() for dependencies',
        'Signal-based state management',
        'Functional guards and resolvers',
        'Cleaner constructor-free code',
        'Modern Angular best practices',
      ],
      codeExamples: [
        {
          filename: 'counter.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <div class="counter">
      <button (click)="decrement()">-</button>
      <span>{{ count() }}</span>
      <button (click)="increment()">+</button>
    </div>
  \`
})
export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update(c => c + 1);
  }

  decrement() {
    this.count.update(c => c - 1);
  }
}`,
        },
        {
          filename: 'todo-item.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-todo-item',
  standalone: true,
  template: \`
    <li [class.completed]="todo().completed">
      <input
        type="checkbox"
        [checked]="todo().completed"
        (change)="toggle()"
      />
      <span>{{ todo().text }}</span>
      <button (click)="remove()">×</button>
    </li>
  \`
})
export class TodoItemComponent {
  todo = input.required<Todo>();
  toggleChange = output<Todo>();
  removeClick = output<number>();

  toggle() {
    this.toggleChange.emit({
      ...this.todo(),
      completed: !this.todo().completed
    });
  }

  remove() {
    this.removeClick.emit(this.todo().id);
  }
}`,
        },
      ],
    },
    {
      title: 'Modal Component',
      description:
        'Reusable dialog component with backdrop. Supports custom content and actions.',
      icon: '🪟',
      color: '#f97316',
      content: 'Modal components provide overlay dialogs for user interactions.',
      link: 'https://angular.dev/guide/components',
      category: 'ui',
      features: [
        'Backdrop with click-to-close',
        'Custom content projection',
        'Keyboard escape support',
        'Focus trapping',
        'Animation support',
      ],
      codeExamples: [
        {
          filename: 'modal.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-modal',
  standalone: true,
  template: \`
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <header>
          <h2>{{ title }}</h2>
          <button (click)="close()">×</button>
        </header>
        <ng-content />
        <footer>
          <ng-content select="[modal-actions]" />
        </footer>
      </div>
    </div>
  \`,
  host: {
    '(document:keydown.escape)': 'close()'
  }
})
export class ModalComponent {
  title = input('');
  closeClick = output();

  close() {
    this.closeClick.emit();
  }
}`,
        },
      ],
    },
    {
      title: 'Tab Component',
      description:
        'Tabbed interface with keyboard navigation. Supports lazy loading tab content.',
      icon: '📑',
      color: '#a855f7',
      content: 'Tab components organize content into switchable panels.',
      link: 'https://angular.dev/guide/components',
      category: 'ui',
      features: [
        'Keyboard arrow navigation',
        'Lazy content loading',
        'Animated transitions',
        'Closeable tabs',
        'Drag to reorder',
      ],
      codeExamples: [
        {
          filename: 'tabs.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-tabs',
  standalone: true,
  template: \`
    <div class="tabs" role="tablist">
      @for (tab of tabs(); track tab.id) {
        <button
          role="tab"
          [attr.aria-selected]="activeTab() === tab.id"
          [class.active]="activeTab() === tab.id"
          (click)="selectTab(tab.id)"
          (keydown.arrowright)="selectNext()"
          (keydown.arrowleft)="selectPrev()"
        >
          {{ tab.label }}
          @if (tab.closable) {
            <span (click)="closeTab(tab.id, $event)">×</span>
          }
        </button>
      }
    </div>
    <div class="tab-panels">
      @for (tab of tabs(); track tab.id) {
        @if (activeTab() === tab.id) {
          <div role="tabpanel">
            <ng-container *ngComponentOutlet="tab.component" />
          </div>
        }
      }
    </div>
  \`
})
export class TabsComponent {
  tabs = signal<TabConfig[]>([]);
  activeTab = signal<string>('');

  selectTab(id: string) {
    this.activeTab.set(id);
  }
}`,
        },
      ],
    },
    {
      title: 'Tooltip Component',
      description:
        'Contextual popup on hover or focus. Positioned with CDK Overlay.',
      icon: '💬',
      color: '#0ea5e9',
      content: 'Tooltips provide contextual information on interaction.',
      link: 'https://material.angular.io/cdk/overlay/overview',
      category: 'ui',
      features: [
        'CDK Overlay positioning',
        'Auto-hide on scroll',
        'Delay show/hide',
        'Custom positioning',
        'Touch support',
      ],
      codeExamples: [
        {
          filename: 'tooltip.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-tooltip',
  standalone: true,
  template: \`
    <span
      #trigger
      (mouseenter)="show()"
      (mouseleave)="hide()"
      (focus)="show()"
      (blur)="hide()"
    >
      <ng-content />
    </span>
    @if (visible()) {
      <div
        class="tooltip"
        [style.left]="position().x + 'px'"
        [style.top]="position().y + 'px'"
      >
        {{ content() }}
      </div>
    }
  \`
})
export class TooltipComponent {
  content = input('');
  visible = signal(false);
  position = signal({ x: 0, y: 0 });
  private overlay = inject(Overlay);
  private trigger = viewChild.required<ElementRef>('trigger');

  show() {
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    this.position.set({
      x: rect.left,
      y: rect.bottom + 8
    });
    this.visible.set(true);
  }

  hide() {
    this.visible.set(false);
  }
}`,
        },
      ],
    },
    {
      title: 'Animation Component',
      description:
        'Component with Angular animations for smooth transitions. Trigger, state, and transition APIs.',
      icon: '✨',
      color: '#84cc16',
      content: "Animated components use Angular's animation system for engaging user experiences.",
      link: 'https://angular.dev/guide/animations',
      category: 'ui',
      features: [
        'Trigger and state animations',
        'Transition timing functions',
        'Keyframe animations',
        'Route transition animations',
        'Stagger animations for lists',
      ],
      codeExamples: [
        {
          filename: 'animated-card.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-animated-card',
  standalone: true,
  animations: [
    trigger('cardState', [
      state('default', style({
        transform: 'scale(1)',
        opacity: 1
      })),
      state('hover', style({
        transform: 'scale(1.05)',
        opacity: 0.9
      })),
      transition('default => hover', [
        animate('200ms ease-out')
      ]),
      transition('hover => default', [
        animate('150ms ease-in')
      ])
    ])
  ],
  template: \`
    <div
      @cardState="cardState"
      (mouseenter)="onHover()"
      (mouseleave)="onLeave()"
      class="card"
    >
      {{ title }}
    </div>
  \`
})
export class AnimatedCardComponent {
  cardState: 'default' | 'hover' = 'default';

  onHover() {
    this.cardState = 'hover';
  }

  onLeave() {
    this.cardState = 'default';
  }
}`,
        },
        {
          filename: 'list-animations.ts',
          language: 'typescript',
          code: `// Stagger animation for lists
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(-20px)'
      }),
      stagger(100, [
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ])
    ], { optional: true })
  ])
]);

// Usage in component
@Component({
  animations: [listAnimation]
})`,
        },
      ],
    },
    // Advanced Components
    {
      title: 'Dynamic Component',
      description:
        'Component loaded programmatically at runtime. Uses ViewContainerRef and ComponentFactory.',
      icon: '🔄',
      color: '#f59e0b',
      content: 'Dynamic components are created and destroyed programmatically based on runtime conditions.',
      link: 'https://angular.dev/guide/dynamic-component-loader',
      category: 'advanced',
      features: [
        'Runtime component creation',
        'ViewContainerRef injection',
        'Component reflection API',
        'Dynamic input binding',
        'Useful for dashboards/widgets',
      ],
      codeExamples: [
        {
          filename: 'dynamic-host.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: \`
    <div class="dashboard">
      @for (widget of widgets(); track widget.id) {
        <ng-container
          *ngComponentOutlet="widget.component;
                             inputs: widget.inputs"
        />
      }
    </div>
  \`
})
export class DashboardComponent {
  private viewContainer = inject(ViewContainerRef);

  widgets = signal<WidgetConfig[]>([
    { id: 1, component: ChartComponent, inputs: { data: chartData } },
    { id: 2, component: StatsComponent, inputs: { metrics } }
  ]);

  loadComponent(component: Type<any>, inputs: any) {
    const componentRef = this.viewContainer.createComponent(component);
    Object.assign(componentRef.instance, inputs);
  }
}`,
        },
        {
          filename: 'widget-registry.ts',
          language: 'typescript',
          code: `// Widget configuration
interface WidgetConfig {
  id: number;
  component: Type<any>;
  inputs: Record<string, any>;
}

// Dynamic widget loader
@Injectable({ providedIn: 'root' })
export class WidgetService {
  private registry = new Map<string, Type<any>>();

  register(name: string, component: Type<any>) {
    this.registry.set(name, component);
  }

  getWidget(name: string): Type<any> | undefined {
    return this.registry.get(name);
  }
}`,
        },
      ],
    },
    {
      title: 'Recursive Component',
      description:
        'Component that calls itself to render nested structures. Perfect for trees and nested comments.',
      icon: '🌳',
      color: '#8b5cf6',
      content: 'Recursive components render themselves to handle arbitrarily nested data structures.',
      link: 'https://angular.dev/guide/components',
      category: 'advanced',
      features: [
        'Self-referencing template',
        'Handles nested data structures',
        'Perfect for trees/menus',
        'Base case prevents infinite recursion',
        'TrackBy for performance',
      ],
      codeExamples: [
        {
          filename: 'tree-node.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [CommonModule, TreeNodeComponent],
  template: \`
    <li class="tree-node">
      <div (click)="toggle()">
        <span>{{ node().label }}</span>
        @if (node().children?.length) {
          <span>{{ expanded() ? '▼' : '▶' }}</span>
        }
      </div>
      @if (expanded() && node().children?.length) {
        <ul>
          @for (child of node().children; track child.id) {
            <app-tree-node [node]="child" />
          }
        </ul>
      }
    </li>
  \`
})
export class TreeNodeComponent {
  node = input.required<TreeNode>();
  expanded = signal(false);

  toggle() {
    this.expanded.update(e => !e);
  }
}`,
        },
        {
          filename: 'nested-comments.html',
          language: 'html',
          code: `<!-- Recursive comment thread -->
<ul class="comment-list">
  @for (comment of comments; track comment.id) {
    <app-comment-item
      [comment]="comment"
      (reply)="addReply($event)"
    >
      @if (comment.replies?.length) {
        <ul class="replies">
          @for (reply of comment.replies; track reply.id) {
            <app-comment-item [comment]="reply" />
          }
        </ul>
      }
    </app-comment-item>
  }
</ul>`,
        },
      ],
    },
    {
      title: 'Transclude Component',
      description:
        'Component with content projection using ng-content. Supports multi-slot projection.',
      icon: '📤',
      color: '#14b8a6',
      content: 'Content projection allows flexible component composition.',
      link: 'https://angular.dev/guide/components/content-projection',
      category: 'advanced',
      features: [
        'Single slot projection',
        'Multi-slot projection',
        'ngProjectAs directive',
        'Conditional projection',
        'Nested projection support',
      ],
      codeExamples: [
        {
          filename: 'card.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-card',
  standalone: true,
  template: \`
    <article class="card">
      <header>
        <ng-content select="[card-header]" />
      </header>
      <div class="card-body">
        <ng-content />
      </div>
      <footer>
        <ng-content select="[card-footer]" />
      </footer>
    </article>
  \`
})
export class CardComponent {}

// Usage
<app-card>
  <h2 card-header>Title</h2>
  <p>Card content here...</p>
  <button card-footer>Action</button>
</app-card>`,
        },
      ],
    },
    // Form Components
    {
      title: 'Form Component',
      description:
        'Component with reactive forms using FormGroup and FormControl. Modern template-driven forms.',
      icon: '📝',
      color: '#3b82f6',
      content: 'Form components handle user input with validation, error handling, and submission logic.',
      link: 'https://angular.dev/guide/forms',
      category: 'forms',
      features: [
        'Reactive forms with signals',
        'FormControl and FormGroup',
        'Custom validators',
        'Error state handling',
        'Form array for dynamic fields',
      ],
      codeExamples: [
        {
          filename: 'user-form.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: \`
    <form [formGroup]="form" (ngSubmit)="submit()">
      <input
        formControlName="email"
        placeholder="Email"
      />
      @if (email.invalid && email.touched) {
        <error-messages [control]="email" />
      }

      <input
        formControlName="password"
        type="password"
        placeholder="Password"
      />

      <button
        type="submit"
        [disabled]="form.invalid"
      >
        Submit
      </button>
    </form>
  \`
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  submitEvent = output<User>();

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get email() {
    return this.form.controls.email;
  }

  submit() {
    if (this.form.valid) {
      this.submitEvent.emit(this.form.getRawValue());
    }
  }
}`,
        },
        {
          filename: 'custom-validator.ts',
          language: 'typescript',
          code: `// Custom password validator
export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value || '';
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);

  const valid = hasUpper && hasLower && hasNumber;

  return valid ? null : {
    weakPassword: 'Password must contain uppercase, lowercase, and number'
  };
};`,
        },
      ],
    },
    {
      title: 'Form Array Component',
      description:
        'Dynamic form with repeatable fields. Add/remove form controls at runtime.',
      icon: '📋',
      color: '#6366f1',
      content: 'FormArray enables dynamic forms with variable numbers of controls.',
      link: 'https://angular.dev/guide/forms/reactive-forms#dynamic-arrays',
      category: 'forms',
      features: [
        'Dynamic form controls',
        'Add/remove fields',
        'Nested form groups',
        'Custom form array controls',
        'Validation for arrays',
      ],
      codeExamples: [
        {
          filename: 'dynamic-form.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-skills-form',
  standalone: true,
  template: \`
    <form [formGroup]="form">
      <div formArrayName="skills">
        @for (skill of skills.controls; track $index) {
          <div [formGroupName]="$index">
            <input formControlName="name" placeholder="Skill" />
            <input formControlName="level" placeholder="Level" />
            <button (click)="removeSkill($index)">Remove</button>
          </div>
        }
      </div>
      <button (click)="addSkill()">Add Skill</button>
    </form>
  \`
})
export class SkillsFormComponent {
  form = this.fb.group({
    skills: this.fb.array([])
  });

  get skills() {
    return this.form.controls.skills as FormArray;
  }

  addSkill() {
    this.skills.push(this.fb.group({
      name: '',
      level: 1
    }));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }
}`,
        },
      ],
    },
    // Performance Components
    {
      title: 'Virtual Scroll Component',
      description:
        'Component that renders only visible items from large lists. CDK Virtual Scroll for performance.',
      icon: '📜',
      color: '#06b6d4',
      content: 'Virtual scrolling renders only visible items, enabling smooth scrolling through thousands of records.',
      link: 'https://material.angular.io/cdk/scrolling/overview',
      category: 'performance',
      features: [
        'Renders only visible items',
        'Fixed or dynamic item sizes',
        'Scroll viewport recycling',
        'Massive performance gains',
        'CDK ScrollModule support',
      ],
      codeExamples: [
        {
          filename: 'virtual-list.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-virtual-list',
  standalone: true,
  imports: [ScrollingModule],
  template: \`
    <cdk-virtual-scroll-viewport
      [itemSize]="50"
      class="viewport"
    >
      <div
        *cdkVirtualFor="let item of items;
                       trackBy: trackById"
        class="item"
      >
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  \`
})
export class VirtualListComponent {
  items = signal<LargeItem[]>([]);

  trackById(index: number, item: LargeItem) {
    return item.id;
  }
}`,
        },
        {
          filename: 'virtual-grid.scss',
          language: 'scss',
          code: `.viewport {
  height: 500px;
  overflow: auto;
  contain: strict;

  .item {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #e0e0e0;

    &:hover {
      background: #f5f5f5;
    }
  }
}`,
        },
      ],
    },
    {
      title: 'Drag & Drop Component',
      description:
        'Interactive component with drag-and-drop functionality. CDK DragDrop for sortable lists.',
      icon: '🎯',
      color: '#f43f5e',
      content: 'Drag and drop components enable intuitive reordering and data transfer interactions.',
      link: 'https://material.angular.io/cdk/drag-drop/overview',
      category: 'performance',
      features: [
        'CDK DragDrop directive',
        'Sortable lists with CdkDropList',
        'Drag previews and placeholders',
        'Drop list connections',
        'Custom drag handles',
      ],
      codeExamples: [
        {
          filename: 'sortable-list.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-sortable-list',
  standalone: true,
  imports: [DragDropModule],
  template: \`
    <div
      cdkDropList
      [cdkDropListData]="items()"
      (cdkDropListDropped)="drop($event)"
      class="drop-list"
    >
      @for (item of items(); track item.id) {
        <div
          cdkDrag
          class="drag-item"
        >
          {{ item.name }}
          <span cdkDragHandle>⋮⋮</span>
        </div>
      }
    </div>
  \`
})
export class SortableListComponent {
  items = signal<Item[]>([]);

  drop(event: CdkDragDrop<Item[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.items.update(items => [...items]);
  }
}`,
        },
        {
          filename: 'drag-drop.scss',
          language: 'scss',
          code: `.drop-list {
  max-width: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;

.drag-item {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;

  &:last-child {
    border-bottom: none;
  }
}

.cdk-drag-preview {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.cdk-drag-placeholder {
  opacity: 0.5;
}`,
        },
      ],
    },
    {
      title: 'Infinite Scroll',
      description:
        'Component that loads more data on scroll. Perfect for feeds and large datasets.',
      icon: '📥',
      color: '#22c55e',
      content: 'Infinite scroll automatically loads more content as user scrolls.',
      link: 'https://material.angular.io/cdk/scrolling/overview',
      category: 'performance',
      features: [
        'Scroll threshold detection',
        'Automatic data loading',
        'Loading state management',
        'End of list detection',
        'CDK ScrollEvents',
      ],
      codeExamples: [
        {
          filename: 'infinite-scroll.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-infinite-feed',
  standalone: true,
  template: \`
    <div
      class="feed-container"
      (window:scroll)="onScroll()"
      #scrollContainer
    >
      @for (item of items(); track item.id) {
        <feed-item [item]="item" />
      }
      @if (loading()) {
        <loading-spinner />
      }
      @if (hasMore()) {
        <scroll-anchor #anchor></scroll-anchor>
      }
    </div>
  \`
})
export class InfiniteFeedComponent {
  private scrollThreshold = 300;
  items = signal<FeedItem[]>([]);
  loading = signal(false);
  hasMore = signal(true);
  page = signal(1);

  onScroll() {
    const container = this.scrollContainer.nativeElement;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < this.scrollThreshold) {
      this.loadMore();
    }
  }

  async loadMore() {
    if (this.loading()) return;
    this.loading.set(true);
    const data = await this.service.getPage(this.page());
    this.items.update(items => [...items, ...data]);
    this.page.update(p => p + 1);
    this.loading.set(false);
  }
}`,
        },
      ],
    },
    {
      title: 'Data Table',
      description:
        'Feature-rich table with sorting, filtering, and pagination. CDK Table based.',
      icon: '📊',
      color: '#64748b',
      content: 'Data tables display and manage large datasets efficiently.',
      link: 'https://material.angular.io/cdk/table/overview',
      category: 'performance',
      features: [
        'CDK Table foundation',
        'Sortable columns',
        'Filter rows',
        'Pagination support',
        'Row selection',
      ],
      codeExamples: [
        {
          filename: 'data-table.component.ts',
          language: 'typescript',
          code: `@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CdkTableModule],
  template: \`
    <cdk-table [dataSource]="dataSource()">
      @for (col of columns(); track col.key) {
        <ng-container [cdkColumnDef]="col.key">
          <cdk-header-cell *cdkHeaderCellDef
            (click)="sort(col.key)"
          >
            {{ col.label }}
            <span>{{ sortDir(col.key) }}</span>
          </cdk-header-cell>
          <cdk-cell *cdkCellDef="let row">
            {{ row[col.key] }}
          </cdk-cell>
        </ng-container>
      }
      <cdk-header-row *cdkHeaderRowDef="columnKeys()" />
      <cdk-row *cdkRowDef="let row; columns: columnKeys()" />
    </cdk-table>
    <cdk-paginator [length]="total()" [pageSize]="pageSize()" />
  \`
})
export class DataTableComponent<T> {
  dataSource = signal<T[]>([]);
  columns = input<ColumnDef[]>([]);
  sortDir = signal<'asc' | 'desc' | null>(null);

  sort(key: string) {
    // Sort logic
  }
}`,
        },
      ],
    },
  ];

  openCard(card: Card): void {
    const WinBoxConstructor = (window as unknown as { WinBox: any }).WinBox;
    if (!WinBoxConstructor) {
      console.error('WinBox is not loaded.');
      return;
    }

    const existingWindow = this.openWindows.find((w) => w.title === card.title);
    if (existingWindow) {
      this.focusWindow(existingWindow);
      return;
    }

    const windowId = card.title.toLowerCase().replace(/\s+/g, '-');
    const cardItem = card as CardItem;
    const features = cardItem.features || [];
    const codeExamples = cardItem.codeExamples || [];

    const featuresHtml =
      features.length > 0
        ? `
      <section style="margin-bottom: 24px;">
        <h3 style="font-size: 1rem; color: #e6edf3; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Key Features</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${features.map((f) => `<li style="position: relative; padding-left: 20px; color: #8b949e; margin-bottom: 8px; line-height: 1.5;"><span style="position: absolute; left: 0; color: ${card.color}; font-weight: bold;">✓</span> ${f}</li>`).join('')}
        </ul>
      </section>
    `
        : '';

    const codeBlocksHtml =
      codeExamples.length > 0
        ? `
      <section style="margin-bottom: 24px;">
        <h3 style="font-size: 1rem; color: #e6edf3; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Code Examples</h3>
        ${codeExamples
          .map(
            (example) => `
          <div style="background: #0d1117; border-radius: 8px; overflow: hidden; margin-bottom: 16px; border: 1px solid #30363d;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: #161b22; border-bottom: 1px solid #30363d;">
              <span style="font-family: 'Fira Code', monospace; font-size: 0.85rem; color: #e6edf3;">${example.filename}</span>
              <span style="font-size: 0.75rem; color: #8b949e; text-transform: uppercase;">${example.language || 'typescript'}</span>
            </div>
            <pre style="margin: 0; padding: 16px; overflow-x: auto;"><code style="font-family: 'Fira Code', 'Monaco', monospace; font-size: 0.85rem; line-height: 1.6; color: #c9d1d9; white-space: pre;">${this.escapeHtml(example.code)}</code></pre>
          </div>
        `
          )
          .join('')}
      </section>
    `
        : '';

    const linkHtml = card.link
      ? `
      <footer style="padding-top: 20px; border-top: 1px solid #30363d;">
        <a href="${card.link}" target="_blank" style="color: ${card.color}; text-decoration: none; font-weight: 500;">Visit ${card.title} Website →</a>
      </footer>
    `
      : '';

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
        <div style="padding: 24px; color: #e6edf3; height: 100%; overflow-y: auto; background: #161b22;">
          <header style="display: flex; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #30363d;">
            <div style="width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; flex-shrink: 0; background: ${card.color};">${card.icon}</div>
            <div>
              <h2 style="margin: 0 0 8px; font-size: 1.5rem; color: #e6edf3;">${card.title}</h2>
              <p style="margin: 0; color: #8b949e; line-height: 1.5;">${card.content}</p>
            </div>
          </header>
          ${featuresHtml}
          ${codeBlocksHtml}
          ${linkHtml}
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

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  focusWindow(win: OpenWindow): void {
    console.log(`[WinBox] Focus window: ${win.title} (${win.id})`);
    this.activeWindowId = win.id;
    win.instance.show();
    win.instance.focus();
  }

  closeWindow(win: OpenWindow, event: Event): void {
    event.stopPropagation();
    console.log(`[WinBox] Close window: ${win.title} (${win.id})`);
    win.instance.close();
    this.removeWindow(win.id);
  }

  minimizeAllWindows(): void {
    console.log(`[WinBox] Minimize all windows (${this.openWindows.length} open)`);
    for (const win of this.openWindows) {
      win.instance.hide();
    }
    this.activeWindowId = '';
  }

  closeAllWindows(): void {
    console.log(`[WinBox] Close all windows (${this.openWindows.length} open)`);
    for (const win of this.openWindows) {
      win.instance.hide();
      win.instance.close();
    }
    this.openWindows = [];
    this.activeWindowId = '';
  }

  private removeWindow(id: string): void {
    this.openWindows = this.openWindows.filter((w) => w.id !== id);
    if (this.activeWindowId === id) {
      const remaining = this.openWindows;
      this.activeWindowId = remaining.length > 0 ? remaining[remaining.length - 1].id : '';
    }
  }
}
