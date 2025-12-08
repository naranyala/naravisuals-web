
<script setup>
import { ref, computed } from 'vue'

const q = ref('')

const modules = [
  { name: 'std (root)', tagline: 'Prelude and core types', description: 'Foundation for portable Rust: core types and prelude items available by default.', examples: 'Vec<T>; Option; Result; println!' },
  { name: 'std::collections', tagline: 'Common data structures', description: 'High-level containers and maps for common use-cases.', examples: 'HashMap; BTreeMap; VecDeque; HashSet' },
  { name: 'std::io', tagline: 'Synchronous I/O', description: 'Streams, readers/writers, and traits for input/output operations.', examples: 'Read; Write; BufReader; stdin; stdout' },
  { name: 'std::fs', tagline: 'Filesystem', description: 'File and directory operations, reading/writing files.', examples: 'File; read_to_string; create_dir' },
  { name: 'std::thread', tagline: 'Concurrency primitives', description: 'Spawn threads and join handles for parallel work.', examples: 'spawn; JoinHandle' },
  { name: 'std::sync', tagline: 'Synchronization', description: 'Mutex, RwLock, Arc and atomic types for safe shared state.', examples: 'Mutex; RwLock; Arc; AtomicUsize' },
  { name: 'std::net', tagline: 'Networking', description: 'TCP/UDP sockets and helpers for networked programs.', examples: 'TcpListener; TcpStream; UdpSocket' },
  { name: 'std::fmt', tagline: 'Formatting', description: 'Formatting traits and macros for display/debug output.', examples: 'format!; Display; Debug' },
  { name: 'std::error', tagline: 'Error traits', description: 'Error trait and helpers for error composition and propagation.', examples: 'Error; Result<T, E>' },
  { name: 'std::time', tagline: 'Time utilities', description: 'Durations and instant types for measuring time.', examples: 'Duration; Instant' },
  { name: 'std::env', tagline: 'Environment', description: 'Access environment variables and args.', examples: 'args; var; current_dir' },
  { name: 'std::ffi', tagline: 'FFI helpers', description: 'C-compatible strings and interop utilities.', examples: 'CString; CStr' }
]

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return modules
  return modules.filter(m =>
    (m.name + ' ' + m.tagline + ' ' + m.description + ' ' + (m.examples||''))
      .toLowerCase()
      .includes(term)
  )
})
</script>

<template>
  <section class="rust-overview">
    <h2>Rust Standard Library Overview</h2>

    <div class="search-wrapper">
      <input v-model="q" placeholder="Search module, trait, type, macro…" class="search" />
    </div>

    <div class="grid">
      <article v-for="m in filtered" :key="m.name" class="card">
        <header class="card-header">
          <h3 class="module-name">{{ m.name }}</h3>
          <span class="tagline">{{ m.tagline }}</span>
        </header>

        <div class="card-body">
          <p class="description">{{ m.description }}</p>
          <p class="examples" v-if="m.examples">
            <strong>Notable items:</strong>
            <code>{{ m.examples }}</code>
          </p>
        </div>
      </article>
    </div>
  </section>
</template>


<style scoped>
.rust-overview {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  background: #0d1117;
  color: #e6edf3;
  min-height: 100vh;
}

/* Title – classic Rust orange gradient */
h2 {
  font-size: 2.3rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #ff7b72, #ff9a5a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Search */
.search-wrapper {
  max-width: 560px;
  margin: 0 auto 3rem;
}

.search {
  width: 100%;
  padding: 1rem 1.4rem;
  font-size: 1.08rem;
  border: 1px solid #30363d;
  border-radius: 12px;
  background: #161b22;
  color: #e6edf3;
  outline: none;
  transition: all 0.22s ease;
}

.search:focus {
  border-color: #ffa657;
  box-shadow: 0 0 0 4px rgba(255, 166, 87, 0.3);
}

/* Grid */
.grid {
  display: grid;
  gap: 1.7rem;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
}

/* Card */
.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.28s ease, border-color 0.28s ease;
}

.card:hover {
  transform: translateY(-7px);
  border-color: #ffa657;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.5);
}

.card-header {
  padding: 1.2rem 1.5rem 0.7rem;
  background: rgba(255, 150, 87, 0.06);
  border-bottom: 1px solid #30363d;
}

.module-name {
  margin: 0;
  font-size: 1.42rem;
  font-family: ui-monospace, "Fira Code", "JetBrains Mono", Menlo, monospace;
  color: #ff9a5a;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.tagline {
  font-size: 0.94rem;
  color: #8b949e;
  font-weight: 500;
  display: block;
  margin-top: 0.3rem;
}

.card-body {
  padding: 1.2rem 1.5rem 1.5rem;
}

.description {
  margin: 0 0 1rem;
  line-height: 1.58;
  color: #c9d1d9;
}

.examples {
  margin: 0;
  font-size: 0.94rem;
  color: #8b949e;
}

.examples code {
  background: #0d1117;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-family: ui-monospace, "Fira Code", "JetBrains Mono", monospace;
  color: #79c0ff;
}
</style>
