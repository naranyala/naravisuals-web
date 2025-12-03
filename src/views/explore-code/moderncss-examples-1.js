// <DOCUMENT filename="modern-css-examples.js">

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

// Modern CSS Fundamentals
export const topics = [
  {
    id: 'custom-properties',
    title: 'CSS Custom Properties',
    description: 'Dynamic values and theming with --variables.',
    example: dedent(`
      :root {
        --primary: #ff6b6b;
        --radius: 12px;
        --spacing: 1.5rem;
      }

      .card {
        background: var(--primary);
        border-radius: var(--radius);
        padding: var(--spacing);
      }
    `)
  },
  {
    id: 'logical-properties',
    title: 'Logical Properties',
    description: 'Direction-aware layout with inset, margin, padding, etc.',
    example: dedent(`
      .box {
        margin-block: 2rem;
        padding-inline: 1.5rem;
        inset-inline-start: 20px;
        border-block-end: 4px solid teal;
      }
    `)
  },
  {
    id: 'container-queries',
    title: 'Container Queries',
    description: 'Style components based on their container size, not viewport.',
    example: dedent(`
      .card-container {
        container-type: inline-size;
      }

      @container (min-width: 300px) {
        .card {
          display: grid;
          grid-template-columns: 1fr 2fr;
        }
      }
    `)
  },
  {
    id: 'cascade-layers',
    title: 'Cascade Layers (@layer)',
    description: 'Control specificity order explicitly.',
    example: dedent(`
      @layer reset, base, components, utilities;

      @layer base {
        * { box-sizing: border-box; }
      }

      @layer utilities {
        .text-center { text-align: center; }
      }
    `)
  },
  {
    id: 'modern-grid',
    title: 'Modern CSS Grid',
    description: 'Subgrid, masonry, and auto-placement power.',
    example: dedent(`
      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .hero {
        display: grid;
        grid-template-areas:
          "title image"
          "text  image";
        grid-auto-columns: 1fr 2fr;
      }
    `)
  },
  {
    id: 'flexbox-gap',
    title: 'Flexbox + Gap',
    description: 'Finally, reliable spacing in flex layouts.',
    example: dedent(`
      .nav {
        display: flex;
        gap: clamp(1rem, 4vw, 3rem);
        flex-wrap: wrap;
        justify-content: space-between;
      }
    `)
  },
];
