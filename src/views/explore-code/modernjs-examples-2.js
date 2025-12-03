

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

export const topics = [
  {
    id: 'weakrefs-finalization',
    title: 'WeakRef & FinalizationRegistry',
    description: 'Observe object garbage collection without preventing it.',
    example: dedent(`
      const cache = new WeakMap();
      const cleanup = new FinalizationRegistry(key => {
        console.log(\`Cleaning up resources for \${key}\`);
      });

      function track(obj, key) {
        const ref = new WeakRef(obj);
        cleanup.register(obj, key);
        cache.set(obj, ref);
      }
    `)
  },
  {
    id: 'numeric-separators',
    title: 'Numeric Separators (_)',
    description: 'Readable large numbers and binary/hex literals.',
    example: dedent(`
      const population = 8_000_000_000;
      const budget = 1_250_000n;
      const mask = 0b1111_1111_1111_0000;
      const hex = 0x1f_2a_3b_4c;
      const pi = 3.141_592_653_589;
    `)
  },
  {
    id: 'string-replaceall',
    title: 'String.prototype.replaceAll',
    description: 'No more regex gymnastics for global replace.',
    example: dedent(`
      const text = 'Hello world, hello universe!';
      const cleaned = text.replaceAll('hello', 'hi').replaceAll(',', '');

      const template = 'Hi {name}, welcome {name}!';
      const message = template.replaceAll('{name}', user.name);
    `)
  },
  {
    id: 'global-this',
    title: 'globalThis',
    description: 'Universal way to access global object.',
    example: dedent(`
      // Works in browser, Node.js, Web Workers, everywhere
      const root = globalThis;

      globalThis.myApp = globalThis.myApp || {};
      globalThis.myApp.version = '2.0';

      console.log(globalThis === window); // true in browser
    `)
  },
  {
    id: 'temporal-proposal',
    title: 'Temporal (Stage 3 → Built-in soon)',
    description: 'The modern, immutable, precise date/time API.',
    example: dedent(`
      const now = Temporal.Now.zonedDateTimeISO();
      const tomorrow = now.add({ days: 1 });
      const duration = Temporal.Duration.from({ hours: 3, minutes: 30 });

      const event = Temporal.ZonedDateTime.from('2025-12-25T19:00[America/New_York]');
      const inUTC = event.withTimeZone('UTC');

      console.log(now.until(tomorrow).toString()); // P1D
    `)
  },
  {
    id: 'pattern-matching',
    title: 'Pattern Matching (Stage 2 → Coming soon)',
    description: 'Expressive destructuring and type switching.',
    example: dedent(`
      when (action) {
        { type: 'LOGIN', payload: user } => login(user),
        { type: 'FETCH_SUCCESS', data }  => render(data),
        { type: 'FETCH_ERROR', error }   => showError(error),
        { value: null | undefined }      => showPlaceholder(),
        _                                => console.log('Unknown')
      }
    `)
  }

]
