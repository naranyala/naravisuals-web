<template>
  <div class="container">
    <h1>Vue 3 Composition API Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic"
        :class="{ active: currentTopic.id === topic.id }">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic">
      <h2>{{ currentTopic.title }}</h2>
      <p>{{ currentTopic.description }}</p>
      <pre class="line-numbers language-javascript" v-html="highlightedCode"></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

// Vue 3 Composition API topics
const topics = [
  {
    id: 'setup-syntax',
    title: 'setup() Syntax',
    description: 'The new setup function and script setup syntax.',
    example: dedent(`
      // Options API (Vue 2 style)
      export default {
        data() {
          return {
            count: 0
          }
        },
        methods: {
          increment() {
            this.count++
          }
        }
      }

      // Composition API with setup()
      export default {
        setup() {
          const count = ref(0)
          const increment = () => count.value++

          return {
            count,
            increment
          }
        }
      }

      // \`<script setup>\` syntax (recommended)
      <script setup>
      import { ref } from 'vue'

      const count = ref(0)
      const increment = () => count.value++
      <\/script>
    `)
  },
  {
    id: 'reactivity',
    title: 'Reactivity Fundamentals',
    description: 'ref(), reactive(), and reactivity in Vue 3.',
    example: dedent(`
      import { ref, reactive, computed, watch } from 'vue'

      // ref for primitive values
      const count = ref(0)
      console.log(count.value) // 0

      // reactive for objects
      const user = reactive({
        name: 'Alice',
        age: 25
      })
      console.log(user.name) // Alice (no .value needed)

      // computed properties
      const doubled = computed(() => count.value * 2)

      // watchers
      watch(count, (newValue, oldValue) => {
        console.log(\`Count changed from \${oldValue} to \${newValue}\`)
      })

      // watchEffect (automatic dependency tracking)
      watchEffect(() => {
        console.log(\`Count is: \${count.value}\`)
      })
    `)
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle Hooks',
    description: 'Composition API lifecycle hooks.',
    example: dedent(`
      import { onMounted, onUpdated, onUnmounted } from 'vue'

      // In setup function or <script setup>
      onMounted(() => {
        console.log('Component mounted!')
        // Fetch data, setup event listeners, etc.
      })

      onUpdated(() => {
        console.log('Component updated!')
      })

      onUnmounted(() => {
        console.log('Component unmounted!')
        // Cleanup event listeners, timers, etc.
      })

      // All lifecycle hooks available:
      // - onBeforeMount
      // - onMounted
      // - onBeforeUpdate
      // - onUpdated
      // - onBeforeUnmount
      // - onUnmounted
      // - onErrorCaptured
      // - onRenderTracked
      // - onRenderTriggered
    `)
  },
  {
    id: 'composables',
    title: 'Composables',
    description: 'Creating reusable composition functions.',
    example: dedent(`
      // useCounter.js composable
      import { ref, computed } from 'vue'

      export function useCounter(initialValue = 0) {
        const count = ref(initialValue)

        const increment = () => count.value++
        const decrement = () => count.value--
        const reset = () => count.value = initialValue
        const doubled = computed(() => count.value * 2)

        return {
          count,
          increment,
          decrement,
          reset,
          doubled
        }
      }

      // Using the composable in a component
      <script setup>
      import { useCounter } from './useCounter'

      const { count, increment, doubled } = useCounter(0)
      <\/script>

      <template>
        <button @click="increment">
          Count is: {{ count }}, Doubled: {{ doubled }}
        </button>
      </template>
    `)
  },
  {
    id: 'props-emits',
    title: 'Props & Emits',
    description: 'Defining props and emitting events in Composition API.',
    example: dedent(`
      // Child component
      <script setup>
      import { defineProps, defineEmits } from 'vue'

      // Props with TypeScript (optional)
      const props = defineProps({
        title: {
          type: String,
          required: true
        },
        count: {
          type: Number,
          default: 0
        }
      })

      // Emits
      const emit = defineEmits(['update:count', 'custom-event'])

      const handleClick = () => {
        emit('update:count', props.count + 1)
        emit('custom-event', 'hello from child')
      }
      <\/script>

      // Parent component usage
      <template>
        <ChildComponent
          :title="pageTitle"
          :count="pageCount"
          @update:count="pageCount = $event"
          @custom-event="handleCustomEvent"
        />
      </template>
    `)
  },
  {
    id: 'template-refs',
    title: 'Template Refs',
    description: 'Accessing DOM elements and component instances.',
    example: dedent(`
      <script setup>
      import { ref, onMounted } from 'vue'

      // Single element ref
      const inputRef = ref(null)

      // Ref array for multiple elements
      const itemRefs = ref([])

      // Component ref
      const childComponentRef = ref(null)

      onMounted(() => {
        // Access after component is mounted
        inputRef.value.focus()
        console.log(itemRefs.value) // Array of DOM elements
        console.log(childComponentRef.value) // Component instance
      })

      // Function ref (for dynamic elements)
      const setItemRef = (el) => {
        if (el) {
          itemRefs.value.push(el)
        }
      }
      <\/script>

      <template>
        <input ref="inputRef" type="text">

        <div v-for="item in items" :key="item.id" :ref="setItemRef">
          {{ item.name }}
        </div>

        <ChildComponent ref="childComponentRef" />
      </template>
    `)
  },
  {
    id: 'provide-inject',
    title: 'Provide/Inject',
    description: 'Cross-component communication without props drilling.',
    example: dedent(`
      // Ancestor component (provider)
      <script setup>
      import { provide, ref } from 'vue'

      const theme = ref('dark')
      const user = ref({ name: 'Alice' })

      // Provide data to descendant components
      provide('theme', theme)
      provide('user', user)
      provide('updateTheme', (newTheme) => {
        theme.value = newTheme
      })
      <\/script>

      // Descendant component (consumer)
      <script setup>
      import { inject } from 'vue'

      // Inject with default value
      const theme = inject('theme', 'light')

      // Inject without default (assumes provided)
      const user = inject('user')
      const updateTheme = inject('updateTheme')

      const toggleTheme = () => {
        updateTheme(theme === 'dark' ? 'light' : 'dark')
      }
      <\/script>

      <template>
        <div :class="\`theme-\${theme}\`">
          Hello, {{ user.name }}
          <button @click="toggleTheme">Toggle Theme</button>
        </div>
      </template>
    `)
  },
  {
    id: 'suspense',
    title: 'Suspense (Experimental)',
    description: 'Handling async dependencies in components.',
    example: dedent(`
      // Async component
      <script setup>
      const data = await fetch('/api/data').then(r => r.json())
      <\/script>

      <template>
        <div>{{ data }}</div>
      </template>

      // Parent using Suspense
      <template>
        <Suspense>
          <template #default>
            <AsyncComponent />
          </template>
          <template #fallback>
            <div>Loading...</div>
          </template>
        </Suspense>
      </template>
    `)
  }
]

const currentTopic = ref(topics[0])

const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  return Prism.highlight(code, Prism.languages.javascript, 'javascript')
})

// Initialize Prism
onMounted(() => {
  Prism.highlightAll()
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
  background: #42b883;
  /* Vue green */
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.1s;
}

button:hover {
  background: #369870;
  transform: translateY(-1px);
}

button.active {
  background: #35495e;
  /* Vue dark blue */
}

h1 {
  color: #2d3748;
  margin-bottom: 1.5rem;
}

h2 {
  color: #42b883;
  margin-bottom: 0.5rem;
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
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

pre.line-numbers {
  position: relative;
  padding-left: 3.8em;
}
</style>
