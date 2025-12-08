
<script setup>
import { ref, computed } from 'vue'

const q = ref('')

const libraries = [
  {
    name: 'Basic',
    tagline: 'Core helpers and globals',
    description: 'Provides fundamental functions (print, type, assert, error, ipairs, pairs, load, dofile) and coroutine support as part of the core/basic library.',
    examples: 'print, assert, load'
  },
  {
    name: 'Table',
    tagline: 'Table manipulation utilities',
    description: 'Functions to manipulate arrays and dictionaries: insert, remove, sort, concat, move, pack/unpack.',
    examples: 'table.insert, table.sort'
  },
  {
    name: 'String',
    tagline: 'String processing and patterns',
    description: 'Pattern-based matching, formatting and manipulation: sub, find, gsub, match, format.',
    examples: 'string.gsub, string.match'
  },
  {
    name: 'Math',
    tagline: 'Mathematical functions',
    description: 'Standard math operations and constants: sin, cos, floor, random, huge, pi.',
    examples: 'math.random, math.floor'
  },
  {
    name: 'IO',
    tagline: 'File input/output',
    description: 'File handles and operations: open, read, write, lines, flush; works with standard streams.',
    examples: 'io.open, io.read'
  },
  {
    name: 'OS',
    tagline: 'Operating system facilities',
    description: 'Date/time, environment, execute, exit; platform-dependent utilities.',
    examples: 'os.time, os.execute'
  },
  {
    name: 'Package',
    tagline: 'Module/package management',
    description: 'Controls module loading (require), package.path and package.cpath for C modules.',
    examples: 'require, package.path'
  },
  {
    name: 'Debug',
    tagline: 'Debugging and introspection',
    description: 'Low-level introspection: getinfo, traceback, sethook — useful for debuggers and profilers.',
    examples: 'debug.getinfo, debug.traceback'
  },
  {
    name: 'UTF-8',
    tagline: 'UTF-8 helpers',
    description: 'Utilities for UTF-8 string handling (length, codes, offsets) in modern Lua versions.',
    examples: 'utf8.len, utf8.codes'
  }
]

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return libraries
  return libraries.filter(l =>
    (l.name + ' ' + l.tagline + ' ' + l.description + ' ' + (l.examples||''))
      .toLowerCase()
      .includes(term)
  )
})
</script>

<template>
  <section class="lua-overview">
    <h2>Lua Standard Library Overview</h2>

    <div class="search-wrapper">
      <input v-model="q" placeholder="Search libraries, functions…" class="search" />
    </div>

    <div class="grid">
      <article v-for="lib in filtered" :key="lib.name" class="card">
        <header class="card-header">
          <h3>{{ lib.name }}</h3>
          <span class="tagline">{{ lib.tagline }}</span>
        </header>

        <div class="card-body">
          <p class="description">{{ lib.description }}</p>
          <p class="examples" v-if="lib.examples">
            <strong>Examples:</strong> <code>{{ lib.examples }}</code>
          </p>
        </div>
      </article>
    </div>
  </section>
</template>


<style scoped>
.lua-overview {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: #e2e8f0;
  background: #0d1117;           /* GitHub-like dark */
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(90deg, #58a6ff, #c16eff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Search */
.search-wrapper {
  position: relative;
  max-width: 480px;
  margin: 0 auto 2.5rem;
}

.search {
  width: 100%;
  padding: 0.9rem 1.2rem;
  font-size: 1rem;
  border: 1px solid #30363d;
  border-radius: 12px;
  background: #161b22;
  color: #e2e8f0;
  outline: none;
  transition: all 0.2s;
}

.search:focus {
  border-color: #58a6ff;
  box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.25);
}

/* Grid of cards */
.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

/* Card */
.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: #58a6ff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.card-header {
  padding: 1rem 1.25rem 0.5rem;
  border-bottom: 1px solid #30363d;
}

.card-header h3 {
  margin: 0;
  font-size: 1.35rem;
  color: #58a6ff;
}

.tagline {
  font-size: 0.9rem;
  color: #8b949e;
  font-weight: 500;
}

.card-body {
  padding: 1rem 1.25rem 1.25rem;
}

.description {
  margin: 0 0 0.75rem;
  line-height: 1.5;
  color: #c9d1d9;
}

.examples {
  margin: 0;
  font-size: 0.9rem;
  color: #8b949e;
}

.examples code {
  background: #0d1117;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
}
</style>
