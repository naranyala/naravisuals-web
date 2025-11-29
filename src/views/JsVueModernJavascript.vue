<template>
  <div class="container">
    <h1>Modern JavaScript Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic">
      <pre class="line-numbers language-javascript" v-html="highlightedCode"></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

// Dedent helper to clean template literal padding
function dedent(str) {
  const lines = str.split('\n')
  const nonEmptyLines = lines.filter(line => line.trim() !== '')
  if (nonEmptyLines.length === 0) return ''
  const minIndent = Math.min(
    ...nonEmptyLines.map(line => {
      const match = line.match(/^ */)
      return match ? match[0].length : 0
    })
  )
  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim()
}

// Modern JavaScript topics
const topics = [
  {
    id: 'modules',
    title: 'ES Modules',
    description: 'Importing and exporting code in modern JS.',
    example: dedent(`
      // math.js
      export const PI = 3.14159;

      export function square(x) {
        return x * x;
      }

      export default function greet(name) {
        return \`Hello, \${name}!\`;
      }

      // main.js
      import greet, { PI, square } from './math.js';

      console.log(greet('Alice')); // Hello, Alice!
      console.log(square(4));      // 16
      console.log(PI);             // 3.14159
    `)
  },
  {
    id: 'destructuring',
    title: 'Destructuring & Rest/Spread',
    description: 'Elegant ways to unpack arrays and objects.',
    example: dedent(`
      // Array destructuring
      const [first, , third] = ['a', 'b', 'c'];
      console.log(first, third); // 'a' 'c'

      // Object destructuring
      const user = { name: 'Bob', age: 25 };
      const { name, age } = user;
      console.log(name); // 'Bob'

      // Rest & Spread
      const nums = [1, 2, 3];
      const more = [...nums, 4, 5]; // [1,2,3,4,5]

      const { name: userName, ...rest } = user;
      console.log(rest); // { age: 25 }
    `)
  },
  {
    id: 'async-await',
    title: 'Async/Await & Promises',
    description: 'Clean asynchronous code with modern syntax.',
    example: dedent(`
      async function fetchData() {
        try {
          const res = await fetch('https://api.example.com/data');
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();
          console.log(data);
        } catch (err) {
          console.error('Error:', err.message);
        }
      }

      // Parallel requests
      async function loadAll() {
        const [users, posts] = await Promise.all([
          fetch('/users').then(r => r.json()),
          fetch('/posts').then(r => r.json())
        ]);
        console.log(users, posts);
      }
    `)
  },
  {
    id: 'classes',
    title: 'Classes & Inheritance',
    description: 'Syntactic sugar over prototypes with real class semantics.',
    example: dedent(`
      class Animal {
        constructor(name) {
          this.name = name;
        }

        speak() {
          console.log(\`\${this.name} makes a sound.\`);
        }
      }

      class Dog extends Animal {
        speak() {
          console.log(\`\${this.name} barks!\`);
        }
      }

      const dog = new Dog('Rex');
      dog.speak(); // Rex barks!
    `)
  },
  {
    id: 'optional-chaining',
    title: 'Optional Chaining & Nullish Coalescing',
    description: 'Safely access nested properties and handle null/undefined.',
    example: dedent(`
      const user = {
        profile: {
          settings: {
            theme: 'dark'
          }
        }
      };

      // Optional chaining
      console.log(user?.profile?.settings?.theme); // 'dark'
      console.log(user?.profile?.preferences?.lang); // undefined (no error)

      // Nullish coalescing
      const theme = user?.profile?.settings?.theme ?? 'light';
      const count = null ?? 42; // 42 (only null/undefined trigger fallback)
    `)
  },
  {
    id: 'array-methods',
    title: 'Modern Array Methods',
    description: 'map, filter, reduce, and friends.',
    example: dedent(`
      const numbers = [1, 2, 3, 4, 5];

      const doubled = numbers.map(n => n * 2);        // [2,4,6,8,10]
      const evens = numbers.filter(n => n % 2 === 0); // [2,4]
      const sum = numbers.reduce((acc, n) => acc + n, 0); // 15

      // Chaining
      const result = numbers
        .filter(n => n > 2)
        .map(n => n * 10)
        .reduce((a, b) => a + b, 0); // 120
    `)
  },
  {
    id: 'template-literals',
    title: 'Template Literals & Tagged Templates',
    description: 'String interpolation and advanced formatting.',
    example: dedent(`
      const name = 'Alice';
      const age = 30;

      // Basic interpolation
      console.log(\`Hello \${name}, you are \${age}.\`);

      // Multiline
      const html = \`
        <div>
          <h1>\${name}</h1>
          <p>Age: \${age}</p>
        </div>
      \`;

      // Tagged template
      function highlight(strings, ...values) {
        let result = '';
        for (let i = 0; i < values.length; i++) {
          result += strings[i] + \`<mark>\${values[i]}</mark>\`;
        }
        result += strings[strings.length - 1];
        return result;
      }

      console.log(highlight\`Hello \${name}, age \${age}!\`);
    `)
  },
  {
    id: 'top-level-await',
    title: 'Top-Level await (ES2022)',
    description: 'Use await outside async functions in modules.',
    example: dedent(`
      // In a module (e.g., main.js)
      const response = await fetch('/config.json');
      const config = await response.json();

      console.log('Config loaded:', config);

      // Now you can use \`config\` at top level!
      document.body.style.backgroundColor = config.bgColor;
    `)
  }
]

const currentTopic = ref(topics[0])

const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  return Prism.highlight(code, Prism.languages.javascript, 'javascript')
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 1.5rem;
}

nav {
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

button {
  padding: 0.55rem 1rem;
  background: #f6ad55;
  /* Amber (JavaScript yellow-orange) */
  color: #1a202c;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.1s;
}

button:hover {
  background: #ed8936;
  transform: translateY(-1px);
}

h1,
h2 {
  color: #2d3748;
}

p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

pre {
  background: #282c34;
  color: #abb2bf;
  padding: 1.2rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-top: 1rem;
  font-size: 0.95em;
  line-height: 1.45;
  white-space: pre;
  tab-size: 2;
  /* JS commonly uses 2-space tabs */
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

pre.line-numbers {
  position: relative;
  padding-left: 3.8em;
}
</style>
