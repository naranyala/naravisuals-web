
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

// Modern CSS Fundamentals
export const topics = [
  {
    id: 'aspect-ratio',
    title: ':aspect-ratio Property',
    description: 'Native aspect ratio without padding hacks.',
    example: dedent(`
      .video-embed {
        aspect-ratio: 16 / 9;
        width: 100%;
        background: #000;
      }

      .square {
        aspect-ratio: 1 / 1;
      }
    `)
  },
  {
    id: 'has-selector',
    title: ':has() Relational Selector',
    description: 'The "parent" selector we always wanted.',
    example: dedent(`
      article:has(h2) {
        border-left: 5px solid gold;
      }

      .card:has(.badge) {
        outline: 3px solid hotpink;
      }
    `)
  },
  {
    id: 'color-functions',
    title: 'Modern Color Functions',
    description: 'oklch(), lch(), color-mix(), relative colors.',
    example: dedent(`
      :root {
        --brand: oklch(70% 0.3 280);
      }

      .button {
        background: color-mix(in oklch, var(--brand) 80%, black);
        color: oklch(from var(--brand) calc(l + 20%) c h);
      }
    `)
  },
  {
    id: 'scroll-snap',
    title: 'Scroll Snap',
    description: 'Native carousel-like behavior.',
    example: dedent(`
      .carousel {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
      }

      .slide {
        scroll-snap-align: center;
        flex-shrink: 0;
        width: 100%;
      }
    `)
  },
  {
    id: 'clamp-responsive',
    title: 'clamp() Fluid Typography',
    description: 'Truly responsive text that scales beautifully.',
    example: dedent(`
      h1 {
        font-size: clamp(2rem, 8vw + 1rem, 6rem);
      }

      p {
        line-height: clamp(1.5, 2vw + 1.2, 1.8);
      }
    `)
  },
  {
    id: 'nesting',
    title: 'Native CSS Nesting',
    description: 'Sass-like nesting, now in vanilla CSS (2024+).',
    example: dedent(`
      .card {
        background: white;
        padding: 2rem;
        border-radius: 1rem;

        & img {
          width: 100%;
          border-radius: 0.5rem;
        }

        &:hover {
          transform: translateY(-8px);
        }
      }
    `)
  }

]
