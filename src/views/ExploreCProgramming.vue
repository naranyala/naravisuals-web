<template>
  <div class="container">
    <h1>C Programming Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic">
      <pre class="line-numbers language-c" v-html="highlightedCode"></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-c'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

// Utility: remove common leading whitespace (for clean template literals)
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

// C topics
const topics = [
  {
    id: 'hello-world',
    title: 'Hello, World!',
    description: 'The classic first program in C.',
    example: dedent(`
      #include <stdio.h>

      int main() {
          printf("Hello, World!\\n");
          return 0;
      }
    `)
  },
  {
    id: 'pointers',
    title: 'Pointers',
    description: 'Understanding memory addresses and pointer arithmetic.',
    example: dedent(`
      #include <stdio.h>

      int main() {
          int x = 42;
          int *ptr = &x;

          printf("Value: %d\\n", *ptr);
          printf("Address: %p\\n", (void*)ptr);
          return 0;
      }
    `)
  },
  {
    id: 'memory',
    title: 'Dynamic Memory',
    description: 'Using malloc, calloc, realloc, and free.',
    example: dedent(`
      #include <stdio.h>
      #include <stdlib.h>

      int main() {
          int *arr = malloc(5 * sizeof(int));
          if (!arr) return 1;

          for (int i = 0; i < 5; i++) {
              arr[i] = i * i;
          }

          for (int i = 0; i < 5; i++) {
              printf("%d ", arr[i]);
          }
          printf("\\n");

          free(arr);
          return 0;
      }
    `)
  },
  {
    id: 'structs',
    title: 'Structs',
    description: 'Grouping related data with structures.',
    example: dedent(`
      #include <stdio.h>
      #include <string.h>

      typedef struct {
          char name[50];
          int age;
      } Person;

      int main() {
          Person p1;
          strcpy(p1.name, "Alice");
          p1.age = 30;

          printf("%s is %d years old.\\n", p1.name, p1.age);
          return 0;
      }
    `)
  },
  {
    id: 'files',
    title: 'File I/O',
    description: 'Reading from and writing to files in C.',
    example: dedent(`
      #include <stdio.h>

      int main() {
          FILE *file = fopen("example.txt", "w");
          if (!file) return 1;

          fprintf(file, "Hello from C!\\n");
          fclose(file);

          file = fopen("example.txt", "r");
          char buffer[100];
          if (fgets(buffer, sizeof(buffer), file)) {
              printf("Read: %s", buffer);
          }
          fclose(file);
          return 0;
      }
    `)
  },
  {
    id: 'macros',
    title: 'Preprocessor Macros',
    description: 'Using #define for constants and functions.',
    example: dedent(`
      #include <stdio.h>

      #define SQUARE(x) ((x) * (x))
      #define PI 3.14159

      int main() {
          int num = 5;
          printf("Square of %d is %d\\n", num, SQUARE(num));
          printf("Value of PI: %.5f\\n", PI);
          return 0;
      }
    `)
  }
]

const currentTopic = ref(topics[0])

// Highlight code reactively using Prism
const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  // Ensure C grammar is loaded
  return Prism.highlight(code, Prism.languages.c, 'c')
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  font-family: system-ui, sans-serif;
  padding: 1.5rem;
}

nav {
  margin-bottom: 1.5rem;
}

button {
  margin-right: 0.6rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 1rem;
  background: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

button:hover {
  background: #2d3748;
}

h1,
h2 {
  color: #2d3748;
}

p {
  color: #4a5568;
  line-height: 1.6;
}

pre {
  background: #282c34;
  color: #abb2bf;
  padding: 1.2rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-top: 1rem;
  font-size: 0.95em;
  line-height: 1.4;
  white-space: pre;
  tab-size: 4;
}

/* Optional: improve line number styling */
pre.line-numbers {
  position: relative;
  padding-left: 3.8em;
  counter-reset: linenumber;
}

pre.line-numbers>code {
  position: relative;
  white-space: inherit;
}
</style>
