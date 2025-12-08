
<script setup>
import { ref, computed } from 'vue'

const q = ref('')

const headers = [
  { name: '<assert.h>', tagline: 'Diagnostics', description: 'Macros for runtime assertions used during debugging.', examples: 'assert' },
  { name: '<ctype.h>', tagline: 'Character classification', description: 'Character testing and conversion utilities.', examples: 'isalpha, isdigit, tolower' },
  { name: '<errno.h>', tagline: 'Error reporting', description: 'Defines errno and macros for error codes.', examples: 'errno, perror' },
  { name: '<float.h>', tagline: 'Floating limits', description: 'Implementation-specific floating-point limits and constants.', examples: 'DBL_MAX, FLT_EPSILON' },
  { name: '<limits.h>', tagline: 'Integer limits', description: 'Implementation limits for integer types.', examples: 'INT_MAX, CHAR_BIT' },
  { name: '<math.h>', tagline: 'Mathematics', description: 'Common math functions and constants.', examples: 'sin, cos, sqrt' },
  { name: '<stdlib.h>', tagline: 'General utilities', description: 'Memory management, program control, conversions, random numbers.', examples: 'malloc, free, exit, atoi, rand' },
  { name: '<string.h>', tagline: 'String handling', description: 'C string and memory block operations.', examples: 'strcpy, strlen, memcpy, memcmp' },
  { name: '<stdio.h>', tagline: 'Input/output', description: 'File and stream I/O functions and types.', examples: 'printf, scanf, fopen, fread, fwrite' },
  { name: '<time.h>', tagline: 'Date and time', description: 'Time types and conversion utilities.', examples: 'time, localtime, strftime' },
  { name: '<stddef.h>', tagline: 'Common types', description: 'Defines size_t, ptrdiff_t, and NULL.', examples: 'size_t, offsetof' },
  { name: '<stdint.h>', tagline: 'Fixed-width integers', description: 'Exact-width integer types and limits .', examples: 'int32_t, uint64_t' },
  { name: '<stdbool.h>', tagline: 'Boolean type', description: 'Defines bool, true, false .', examples: 'bool' },
  { name: '<setjmp.h>', tagline: 'Nonlocal jumps', description: 'setjmp/longjmp for nonlocal control flow.', examples: 'setjmp, longjmp' },
  { name: '<signal.h>', tagline: 'Signal handling', description: 'Signal constants and handlers.', examples: 'signal, raise' }
]

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return headers
  return headers.filter(h =>
    (h.name + ' ' + h.tagline + ' ' + h.description + ' ' + (h.examples||''))
      .toLowerCase()
      .includes(term)
  )
})
</script>

<template>
  <section class="c-overview">
    <h2>C Standard Library Overview</h2>

    <div class="search-wrapper">
      <input v-model="q" placeholder="Search header, function, macro…" class="search" />
    </div>

    <div class="grid">
      <article v-for="h in filtered" :key="h.name" class="card">
        <header class="card-header">
          <h3 class="header-name">{{ h.name }}</h3>
          <span class="tagline">{{ h.tagline }}</span>
        </header>

        <div class="card-body">
          <p class="description">{{ h.description }}</p>
          <p class="examples" v-if="h.examples">
            <strong>Common:</strong>
            <code>{{ h.examples }}</code>
          </p>
        </div>
      </article>
    </div>
  </section>
</template>


<style scoped>
.c-overview {
  max-width: 1160px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  background: #0d1117;
  color: #e2e8f0;
  min-height: 100vh;
}

h2 {
  font-size: 2.1rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1.8rem;
  background: linear-gradient(90deg, #39d353, #00d1b2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Search */
.search-wrapper {
  position: relative;
  max-width: 520px;
  margin: 0 auto 2.8rem;
}

.search {
  width: 100%;
  padding: 1rem 1.3rem;
  font-size: 1.05rem;
  border: 1px solid #30363d;
  border-radius: 12px;
  background: #161b22;
  color: #e2e8f0;
  outline: none;
  transition: all 0.22s ease;
}

.search:focus {
  border-color: #39d353;
  box-shadow: 0 0 0 4px rgba(57, 211, 83, 0.3);
}

/* Grid */
.grid {
  display: grid;
  gap: 1.6rem;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}

/* Card */
.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.28s ease;
}

.card:hover {
  transform: translateY(-6px);
  border-color: #39d353;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
}

.card-header {
  padding: 1.1rem 1.4rem 0.6rem;
  background: rgba(57, 211, 83, 0.06);
  border-bottom: 1px solid #30363d;
}

.header-name {
  margin: 0;
  font-size: 1.4rem;
  font-family: ui-monospace, "Cascadia Mono", "Fira Code", Menlo, Monaco, Consolas, monospace;
  color: #39d353;
  font-weight: 600;
}

.tagline {
  font-size: 0.92rem;
  color: #8b949e;
  font-weight: 500;
  display: block;
  margin-top: 0.25rem;
}

.card-body {
  padding: 1.1rem 1.4rem 1.4rem;
}

.description {
  margin: 0 0 0.9rem;
  line-height: 1.55;
  color: #c9d1d9;
}

.examples {
  margin: 0;
  font-size: 0.92rem;
  color: #8b949e;
}

.examples code {
  background: #0d1117;
  padding: 0.22rem 0.5rem;
  border-radius: 6px;
  font-family: ui-monospace, "Cascadia Mono", "Fira Code", monospace;
  color: #79c0ff;
}
</style>
