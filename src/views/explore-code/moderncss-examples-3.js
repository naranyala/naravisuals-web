// <DOCUMENT filename="advanced-modern-css.js">

// Utility to dedent code (remove common leading whitespace)
function dedent(str) {
  const lines = str.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  const minIndent = Math.min(
    ...nonEmptyLines.map(line => {
      const match = line.match(/^ */);
      return match ? match[0].length : 0;
    })
  );
  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim();
}

// Advanced Modern CSS (2025–2026 tier)
export const topics = [
  {
    id: 'anchor-positioning',
    title: 'Anchor Positioning',
    description: 'Position elements relative to any anchor on the page (true tooltips, popovers).',
    example: dedent(`
      .tooltip {
        position: anchor-center;
        anchor-name: --my-anchor;
        inset-area: top;
        margin-block-start: 8px;
      }

      .button {
        anchor-name: --my-anchor;
      }

      /* Dynamic fallback */
      @position-fallback --tooltip-fallback {
        @try {
          top: anchor(bottom);
          left: anchor(center);
        }
        @try { bottom: anchor(top); }
      }
    `)
  },
  {
    id: 'view-transitions',
    title: 'View Transitions API (CSS)',
    description: 'Smooth page transitions with zero JS boilerplate.',
    example: dedent(`
      ::view-transition-old(home-hero),
      ::view-transition-new(home-hero) {
        animation-duration: 1.2s;
        animation-timing-function: ease-out;
      }

      @view-transition {
        navigation: auto;
      }

      .photo-grid img {
        view-transition-name: photo-expand;
      }
    `)
  },
  {
    id: 'scroll-driven-animations',
    title: 'Scroll-Driven Animations',
    description: 'Animations tied directly to scroll progress — no JS intersection observers.',
    example: dedent(`
      .parallax-title {
        animation: fade-up both linear;
        animation-timeline: scroll(root);
        animation-range: entry 20% cover 40%;
      }

      @keyframes fade-up {
        from { opacity: 0; transform: translateY(80px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .progress-bar {
        view-timeline: --article block;
        animation: grow linear forwards;
        animation-timeline: --article;
      }
    `)
  },
  {
    id: 'scope',
    title: '@scope Scoping',
    description: 'Limit selector scope — the missing piece for true component CSS.',
    example: dedent(`
      @scope (.light-theme) {
        :scope h1 { color: #222; }
        .card { background: white; }
      }

      @scope (.card) to (.actions *) {
        button { opacity: 0.7; }
        button:hover { opacity: 1; }
      }

      @scope (.media-card) {
        @scope (.portrait) { img { aspect-ratio: 3/4; } }
        @scope (.landscape) { img { aspect-ratio: 16/9; } }
      }
    `)
  },
  {
    id: 'text-box-control',
    title: 'Advanced Text Control',
    description: 'text-wrap: pretty, balance, and line-clamp improvements.',
    example: dedent(`
      h1, h2, h3 {
        text-wrap: balance;
        text-balance: opt-optical; /* future */
      }

      .article-body p {
        text-wrap: pretty;
      }

      .title {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        line-clamp: 3; /* now standard */
      }
    `)
  },
  {
    id: 'individual-transforms',
    title: 'Individual Transform Properties',
    description: 'Animate translate/rotate/scale independently (no matrix recompute).',
    example: dedent(`
      .card {
        translate: 0 0;
        scale: 1;
        rotate: 0deg;
        transition: translate 0.4s, scale 0.2s, rotate 0.6s;
      }

      .card:hover {
        translate: 0 -12px;
        scale: 1.05;
        rotate: 2deg;
      }
    `)
  },
  {
    id: 'subgrid',
    title: 'CSS Subgrid',
    description: 'Inherit grid tracks from grandparent — perfect alignment.',
    example: dedent(`
      .dashboard {
        display: grid;
        grid-template-columns: 200px repeat(4, 1fr);
        gap: 1rem;
      }

      .widget {
        display: grid;
        grid-column: 2 / -1;
        grid-template-columns: subgrid;
      }

      .widget > * {
        grid-column: span 1;
      }
    `)
  },
  {
    id: 'color-mix-relative',
    title: 'Advanced Color Functions',
    description: 'Relative colors + color-mix() + wider gamut spaces.',
    example: dedent(`
      :root {
        --brand: oklch(75% 0.25 280);
      }

      .btn-primary {
        background: oklch(from var(--brand) 70% 0.3 h);
        border: 2px solid oklch(from var(--brand) l 0.15 h / 80%);
        color: oklch(from var(--brand) calc(l + 30%) c h);
      }

      .gradient {
        background: linear-gradient(
          45deg,
          color-mix(in lch, var(--brand) 70%, white),
          color-mix(in lch, var(--brand), black 40%)
        );
      }
    `)
  },
];
