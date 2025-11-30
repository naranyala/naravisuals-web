<template>
  <div class="container">
    <h1>Rust Programming Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic">
      <pre class="line-numbers language-rust" v-html="highlightedCode"></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-rust'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
// 👇 You MUST import the JS for line-numbers plugin
import 'prismjs/plugins/line-numbers/prism-line-numbers'

// Utility to dedent code (remove common leading whitespace)
function dedent(str) {
  const lines = str.split('\n')
  const nonEmptyLines = lines.filter(line => line.trim() !== '')
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

// Rust topics
const topics = [
  {
    id: 'basics',
    title: 'Rust Basics',
    description: 'Ownership, borrowing, and lifetimes explained.',
    example: dedent(`
      fn main() {
          let x = 5;
          let y = &x;
          println!("y: {}", y);
      }
    `)
  },
  {
    id: 'concurrency',
    title: 'Concurrency',
    description: 'Exploring threads and async in Rust.',
    example: dedent(`
      use std::thread;

      fn main() {
          let handle = thread::spawn(|| {
              println!("Hello from a thread!");
          });
          handle.join().unwrap();
      }
    `)
  },
  {
    id: 'ffi',
    title: 'FFI',
    description: 'Calling Rust from C or vice versa.',
    example: dedent(`
      #[no_mangle]
      pub extern "C" fn add(a: i32, b: i32) -> i32 {
          a + b
      }
    `)
  },
  {
    id: 'macros',
    title: 'Macros',
    description: 'Declarative macros for code generation.',
    example: dedent(`
      macro_rules! say_hello {
          () => {
              println!("Hello, Rust!");
          };
      }

      fn main() {
          say_hello!();
      }
    `)
  },
  {
    id: 'wasm',
    title: 'WebAssembly',
    description: 'Compiling Rust to WebAssembly.',
    example: dedent(`
      use wasm_bindgen::prelude::*;

      #[wasm_bindgen]
      pub fn greet(name: &str) {
          alert(&format!("Hello, {}!", name));
      }
    `)
  },
  {
    id: 'unsafe',
    title: 'Unsafe Rust',
    description: 'Exploring unsafe blocks and raw pointers.',
    example: dedent(`
      fn main() {
          let x: i32 = 42;
          let ptr: *const i32 = &x;

          unsafe {
              println!("Value via raw pointer: {}", *ptr);
          }
      }
    `)
  }
]

const currentTopic = ref(topics[0])

// Computed: highlight code using Prism
const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  return Prism.highlight(code, Prism.languages.rust, 'rust')
})

// Optional: re-highlight on topic change (not strictly needed with computed)
watch(currentTopic, async () => {
  await nextTick()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  font-family: system-ui, sans-serif;
}

nav {
  margin-bottom: 1rem;
}

button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

pre {
  background: #282c34;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-top: 1rem;
  /* Ensure line numbers plugin renders properly */
  white-space: pre;
  tab-size: 4;
}
</style>
