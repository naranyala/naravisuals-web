

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
    id: 'trig-functions',
    title: 'Trigonometric Functions',
    description: 'sin(), cos(), tan() — dynamic angles & circles.',
    example: dedent(`
      .circle-menu {
        --angle: 0deg;
        --radius: 150px;
      }

      li {
        position: absolute;
        inset-inline-start: 50%;
        inset-block-start: 50%;
        translate: -50% -50%;
        offset-rotate: auto;
        offset-distance: var(--radius);
        offset-path: path("M 0,0 L 100,0");
      }

      li:nth-child(1) { --angle: calc(sin(0 * 60deg) * var(--radius)); }
      li:nth-child(2) { --angle: 60deg; }
      /* or just use offset-rotate in the future */
    `)
  },
  {
    id: 'state-queries',
    title: '@container style() & state() Queries',
    description: 'Query custom states and styles from container.',
    example: dedent(`
      .card-container {
        container-type: inline-size;
      }

      @container style(--theme: dark) {
        .card { background: #222; color: white; }
      }

      @container state(expanded) {
        .details { display: block; }
      }
    `)
  },
  {
    id: 'masonry',
    title: 'Native Masonry (display: masonry)',
    description: 'True masonry layout without JS or grid hacks.',
    example: dedent(`
      .gallery {
        display: masonry;
        masonry-auto-flow: dense;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }

      .gallery img {
        width: 100%;
        break-inside: avoid;
      }
    `)
  },
  {
    id: 'popover',
    title: 'Popover API + CSS anchor()',
    description: 'Native popovers, dialogs, and anchor-positioned content.',
    example: dedent(`
      button[popovertarget="my-menu"] {
        anchor-name: --menu-anchor;
      }

      #my-menu {
        popover: auto;
        position: anchor(--menu-anchor);
        inset-area: bottom;
        margin-block-start: 8px;
      }
    `)
  }

]
