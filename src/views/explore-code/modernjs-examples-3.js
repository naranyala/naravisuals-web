// <DOCUMENT filename="advanced-modern-js.js">

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

// Advanced Modern JavaScript (2025–2026 cutting edge)
export const topics = [
  {
    id: 'decorators',
    title: 'Stage 3 Decorators (2025 standard)',
    description: 'Class/method/field decorators — now official, used by Angular, MobX, etc.',
    example: dedent(`
      @observable
      class Store {
        @observable accessor count = 0;

        @action
        increment() {
          this.count++;
        }
      }

      @Component({ template: '<h1>Hello</h1>' })
      class MyElement extends HTMLElement {
        @property() name = 'World';
      }
    `)
  },
  {
    id: 'using-declarations',
    title: 'Explicit Resource Management (using / await using)',
    description: 'Disposable pattern with symbols — finally RAII in JS.',
    example: dedent(`
      using file = await openFile('/data.txt');
      using db = await connectDB();
      using lock = await mutex.acquire();

      const data = await file.readAll();
      // automatically disposed at end of scope (even on throw)
    `)
  },
  {
    id: 'pipeline-operator',
    title: 'Smart Pipeline Operator (|>)',
    description: 'Clean, readable data transformations (F# style).',
    example: dedent(`
      const result = users
        |> filter(?, u => u.active)
        |> map(?, u => u.profile)
        |> await Promise.all(?>
          fetchUserDetails(?)
        )
        |> sort(?, (a, b) => b.score - a.score)
        |> take(?, 10);
    `)
  },
  {
    id: 'import-attributes',
    title: 'Import Attributes (type="json", etc.)',
    description: 'Static imports with assertions → attributes (new syntax).',
    example: dedent(`
      import data from './config.json' with { type: 'json' };
      import wasm from './crypto.wasm' with { type: 'wasm' };
      import html from './template.html' with { type: 'html' };

      // Dynamic
      const module = await import(url, { with: { type: 'css' } });
    `)
  },
  {
    id: 'iterator-helpers',
    title: 'Iterator Helpers (Stage 3 → Built-in soon)',
    description: 'Lazy map, filter, flatMap, take, drop, etc. on any iterable.',
    example: dedent(`
      const numbers = Iterator.from([1, 2, 3, 4, 5, 6]);

      const result = numbers
        .map(x => x * x)
        .filter(x => x > 10)
        .take(3)
        .toArray();

      for (const chunk of readStream().chunk(1024)) {
        await process(chunk);
      }
    `)
  },
  {
    id: 'regexp-v-flag',
    title: 'RegExp /v — Set Notation & Unicode Properties',
    description: 'Finally powerful regex with strings-as-sets.',
    example: dedent(`
      const unicodeWord = /\\p{L}+/gv;  // any letters
      const emoji = /\\p{Emoji}/gv;

      const ipv6 = /^\\[\\p{Hex_Digit}{0,4}:]{7}\\p{Hex_Digit}{0,4}$/v;

      // String deduplication
      const uniqueChars = [...new Set(str.match(/./gvs))];
    `)
  },
  {
    id: 'array-find-from',
    title: 'Array.prototype.findLast / findLastIndex',
    description: 'Search arrays from the end.',
    example: dedent(`
      const lastActive = users.findLast(u => u.active);
      const lastErrorIndex = logs.findLastIndex(log => log.level === 'error');

      // Stack-like usage
      const topFrame = callStack.findLast(frame => frame.type === 'function');
    `)
  },
];
