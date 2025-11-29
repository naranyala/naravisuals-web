<template>
  <div class="container">
    <h1>Lua Programming Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic">
      <pre class="line-numbers language-lua" v-html="highlightedCode"></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-lua'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

// Utility: remove common leading indentation
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

// Lua topics
const topics = [
  {
    id: 'hello-world',
    title: 'Hello, World!',
    description: 'The simplest Lua program.',
    example: dedent(`
      print("Hello, World!")
    `)
  },
  {
    id: 'tables',
    title: 'Tables (Arrays & Objects)',
    description: 'Lua’s only data structure—versatile and powerful.',
    example: dedent(`
      -- Array-like table
      fruits = { "apple", "banana", "cherry" }
      print(fruits[1])  --> apple

      -- Dictionary-like table
      person = {
        name = "Alice",
        age = 30
      }
      print(person.name)  --> Alice
    `)
  },
  {
    id: 'functions',
    title: 'Functions & Closures',
    description: 'First-class functions and lexical scoping.',
    example: dedent(`
      -- Basic function
      function greet(name)
        return "Hello, " .. name .. "!"
      end

      -- Closure
      function makeCounter()
        local count = 0
        return function()
          count = count + 1
          return count
        end
      end

      counter = makeCounter()
      print(counter())  --> 1
      print(counter())  --> 2
    `)
  },
  {
    id: 'control-structures',
    title: 'Control Flow',
    description: 'Conditionals, loops, and logical operators.',
    example: dedent(`
      local x = 10

      if x > 5 then
        print("x is greater than 5")
      elseif x == 5 then
        print("x is 5")
      else
        print("x is less than 5")
      end

      -- While loop
      local i = 1
      while i <= 3 do
        print("Loop:", i)
        i = i + 1
      end

      -- Numeric for
      for j = 1, 3 do
        print("For:", j)
      end
    `)
  },
  {
    id: 'metatables',
    title: 'Metatables & Operator Overloading',
    description: 'Customizing table behavior with metatables.',
    example: dedent(`
      local vec = { x = 1, y = 2 }

      local mt = {
        __add = function(a, b)
          return { x = a.x + b.x, y = a.y + b.y }
        end,
        __tostring = function(v)
          return "(" .. v.x .. ", " .. v.y .. ")"
        end
      }

      setmetatable(vec, mt)
      local vec2 = { x = 3, y = 4 }
      setmetatable(vec2, mt)

      local result = vec + vec2
      print(result)  --> (4, 6)
    `)
  },
  {
    id: 'coroutines',
    title: 'Coroutines (Cooperative Multitasking)',
    description: 'Lightweight concurrency with coroutines.',
    example: dedent(`
      function countdown(n)
        for i = n, 1, -1 do
          print("Count:", i)
          coroutine.yield()
        end
        print("Done!")
      end

      co = coroutine.create(countdown)
      coroutine.resume(co, 3)  --> Count: 3
      coroutine.resume(co)     --> Count: 2
      coroutine.resume(co)     --> Count: 1
      coroutine.resume(co)     --> Done!
    `)
  },
  {
    id: 'file-io',
    title: 'File I/O',
    description: 'Reading and writing files in Lua.',
    example: dedent(`
      -- Write to file
      local file = io.open("test.txt", "w")
      file:write("Hello from Lua!\\n")
      file:close()

      -- Read from file
      local file = io.open("test.txt", "r")
      if file then
        local content = file:read("*all")
        print(content)  --> Hello from Lua!
        file:close()
      end
    `)
  },
  {
    id: 'oop',
    title: 'Object-Oriented Patterns',
    description: 'Simulating classes with tables and metatables.',
    example: dedent(`
      -- Class definition
      local Dog = {}
      Dog.__index = Dog

      function Dog.new(name)
        local self = setmetatable({}, Dog)
        self.name = name
        return self
      end

      function Dog:speak()
        print(self.name .. " says woof!")
      end

      local myDog = Dog.new("Buddy")
      myDog:speak()  --> Buddy says woof!
    `)
  }
]

const currentTopic = ref(topics[0])

const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  return Prism.highlight(code, Prism.languages.lua, 'lua')
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
  background: #e53e3e;
  /* Ruby red (Lua logo color) */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.1s;
}

button:hover {
  background: #c53030;
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

pre.line-numbers {
  position: relative;
  padding-left: 3.8em;
}
</style>
