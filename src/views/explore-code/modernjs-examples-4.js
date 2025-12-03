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

// Advanced Modern JavaScript (2025–2026 cutting edge)
export const topics = [

  {
    id: 'promise-withresolvers',
    title: 'Promise.withResolvers()',
    description: 'Create promise + resolve/reject pair outside constructor.',
    example: dedent(`
      const { promise, resolve, reject } = Promise.withResolvers();

      // Pass resolve/reject to Web APIs, workers, etc.
      worker.postMessage({ type: 'START', promiseId: 123 });
      pendingPromises.set(123, { resolve, reject });

      // Later
      resolve(result);
    `)
  },
  {
    id: 'set-methods',
    title: 'New Set Methods (union, intersection, etc.)',
    description: 'Set algebra finally built-in.',
    example: dedent(`
      const admins = new Set(['alice', 'bob']);
      const moderators = new Set(['bob', 'charlie']);

      const allPrivileged = admins.union(moderators);
      const bothRoles = admins.intersection(moderators);
      const onlyAdmins = admins.difference(moderators);
      const symmetricDiff = admins.symmetricDifference(moderators);

      const isSubset = admins.isSubsetOf(allPrivileged); // true
    `)
  },
  {
    id: 'symbols-as-weakmap-keys',
    title: 'Symbols as WeakMap Keys (Stage 3)',
    description: 'Private-per-instance metadata without #fields.',
    example: dedent(`
      const _metadata = Symbol('metadata');

      class Widget {
        constructor() {
          metadataWeakMap.set(this, { created: Date.now() });
        }
      }

      // Or with unique symbols per class
      const meta = Symbol.for('com.myapp.widget.meta');
    `)
  },
  {
    id: 'temporal',
    title: 'Temporal (Now a global in Deno/Bun, soon everywhere)',
    description: 'The immutable, precise, timezone-aware date/time API.',
    example: dedent(`
      const meeting = Temporal.ZonedDateTime.from('2025-12-03T14:30[America/New_York]');
      const inLondon = meeting.withTimeZone('Europe/London');

      const duration = meeting.until(inLondon.round({ smallestUnit: 'minutes' }));
      console.log(duration.toString()); // PT3H

      const nextWeek = Temporal.Now.plainDateTimeISO().add({ weeks: 1 });
    `)
  },
  {
    id: 'module-sync-functions',
    title: 'Synchronous Module Evaluation (import sync)',
    description: 'Guaranteed top-level sync execution (for certain module types).',
    example: dedent(`
      // config.json module (type: json)
      import config from './config.json' with { type: 'json' };

      // No need for top-level await!
      console.log('API URL:', config.apiUrl);
      startServer(); // safe — config is ready
    `)
  }
]
