// <DOCUMENT filename="fundamental-modern-js.js">

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

// Fundamental Modern JavaScript (2025 essentials)
export const topics = [
  {
    id: 'optional-chaining',
    title: 'Optional Chaining (?.)',
    description: 'Safe property access without null/undefined checks.',
    example: dedent(`
      const name = user?.profile?.name;
      const street = invoice.customer?.address?.street;

      // Also works with arrays and functions
      const firstAdmin = users?.[0]?.role === 'admin';
      const result = fetchData?.();
    `)
  },
  {
    id: 'nullish-coalescing',
    title: 'Nullish Coalescing (??)',
    description: 'Only fallback on null or undefined — not falsy values.',
    example: dedent(`
      const fontSize = userSettings.fontSize ?? 16;
      const theme = preferences.theme ?? 'light';
      const count = items.length ?? 0;

      // Chained with optional chaining
      const apiUrl = config.api?.url ?? 'https://api.example.com';
    `)
  },
  {
    id: 'logical-assignment',
    title: 'Logical Assignment Operators',
    description: '??=, &&=, ||= — concise state updates.',
    example: dedent(`
      let user = null;
      user ??= fetchUser();  // only assign if null/undefined

      let volume = 5;
      volume &&= volume * 2; // only if truthy
      volume ||= 10;         // assign default if falsy
    `)
  },
  {
    id: 'private-fields',
    title: 'Private Class Fields & Methods',
    description: 'True encapsulation with # syntax.',
    example: dedent(`
      class Counter {
        #count = 0;
        #limit = 100;

        increment() {
          if (this.#count < this.#limit) this.#count++;
        }

        #reset() {
          this.#count = 0;
        }

        get value() { return this.#count; }
      }
    `)
  },
  {
    id: 'top-level-await',
    title: 'Top-Level Await',
    description: 'Use await outside async functions in modules.',
    example: dedent(`
      // config.js (module)
      const response = await fetch('/api/config');
      export const config = await response.json();

      // main.js
      import { config } from './config.js';

      console.log('App ready with config:', config);
    `)
  },
  {
    id: 'promise-any',
    title: 'Promise.any() & AggregateError',
    description: 'First settled fulfilled promise wins.',
    example: dedent(`
      try {
        const response = await Promise.any([
          fetch('/fast-api'),
          fetch('/backup-api'),
          fetch('/mirror-api')
        ]);
        const data = await response.json();
      } catch (error) {
        console.log('All APIs failed:', error.errors);
      }
    `)
  },
];
