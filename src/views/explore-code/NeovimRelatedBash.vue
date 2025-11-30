<template>
  <div class="container">
    <h1>Bash Scripting Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic">
      <pre class="line-numbers language-bash" v-html="highlightedCode"></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-bash'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

// Dedent helper to clean up template literal indentation
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

// Bash topics
const topics = [
  {
    id: 'hello-world',
    title: 'Hello, World!',
    description: 'Your first Bash script.',
    example: dedent(`
      #!/bin/bash
      echo "Hello, World!"
    `)
  },
  {
    id: 'variables',
    title: 'Variables & Substitution',
    description: 'Storing and using data in Bash.',
    example: dedent(`
      #!/bin/bash
      name="Alice"
      age=30
      echo "Name: $name"
      echo "Next year: $((age + 1))"
    `)
  },
  {
    id: 'conditionals',
    title: 'Conditionals (if/else)',
    description: 'Making decisions in scripts.',
    example: dedent(`
      #!/bin/bash
      read -p "Enter a number: " num
      if [[ $num -gt 10 ]]; then
          echo "Greater than 10"
      elif [[ $num -eq 10 ]]; then
          echo "Equal to 10"
      else
          echo "Less than 10"
      fi
    `)
  },
  {
    id: 'loops',
    title: 'Loops (for/while)',
    description: 'Repeating tasks efficiently.',
    example: dedent(`
      #!/bin/bash
      # For loop
      for i in {1..3}; do
          echo "Count: $i"
      done

      # While loop
      count=1
      while [[ $count -le 3 ]]; do
          echo "While count: $count"
          ((count++))
      done
    `)
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Reusable blocks of code.',
    example: dedent(`
      #!/bin/bash
      greet() {
          local name=$1
          echo "Hello, $name!"
      }

      greet "Bob"
      greet "Eve"
    `)
  },
  {
    id: 'file-checks',
    title: 'File & Directory Checks',
    description: 'Testing file existence, type, and permissions.',
    example: dedent(`
      #!/bin/bash
      file="example.txt"

      if [[ -f "$file" ]]; then
          echo "$file exists and is a regular file."
      elif [[ -d "$file" ]]; then
          echo "$file is a directory."
      else
          echo "$file does not exist."
      fi
    `)
  },
  {
    id: 'parsing-args',
    title: 'Command-Line Arguments',
    description: 'Handling input from the user.',
    example: dedent(`
      #!/bin/bash
      echo "Script name: $0"
      echo "First arg: $1"
      echo "Number of args: $#"
      echo "All args: $*"

      # Using getopts for flags
      while getopts "v:f:" opt; do
          case $opt in
              v) echo "Verbose mode: $OPTARG" ;;
              f) echo "File: $OPTARG" ;;
              *) echo "Invalid flag" ;;
          esac
      done
    `)
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    description: 'Gracefully managing failures.',
    example: dedent(`
      #!/bin/bash
      set -e  # Exit on error

      echo "Starting..."
      false  # This will cause script to exit
      echo "This won't print"
    `)
  }
]

const currentTopic = ref(topics[0])

const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  return Prism.highlight(code, Prism.languages.bash, 'bash')
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
  background: #319795;
  /* Teal */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.1s;
}

button:hover {
  background: #2c7a7b;
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
  tab-size: 4;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

/* Ensure line numbers align properly */
pre.line-numbers {
  position: relative;
  padding-left: 3.8em;
}
</style>
