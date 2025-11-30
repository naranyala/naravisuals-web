<template>
  <div class="rust60-container">
    <h1>Next 30 Days — Advanced Rust Programming (Day 31–60)</h1>

    <div v-for="(day, i) in days" :key="i" class="day-card">
      <button class="day-header" @click="toggle(i)">
        <span class="day-title">Day {{ i + 31 }} — {{ day.title }}</span>
        <span class="arrow" :class="{ open: isOpen[i] }">▾</span>
      </button>

      <div v-if="isOpen[i]" class="day-content">
        <p>{{ day.desc }}</p>

        <ul>
          <li v-for="(point, j) in day.points" :key="j">
            {{ point }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const isOpen = reactive({});
const toggle = (i) => (isOpen[i] = !isOpen[i]);

const days = [
  {
    title: "Deep Traits & Abstractions",
    desc: "Explore advanced trait features.",
    points: [
      "Supertraits",
      "Trait inheritance patterns",
      "Designing clean abstractions",
    ],
  },
  {
    title: "Generics Internals",
    desc: "Understand generics & how Rust expands them.",
    points: [
      "Monomorphization in detail",
      "Generic trait bounds",
      "Zero-cost abstractions",
    ],
  },
  {
    title: "Lifetimes Mastery",
    desc: "Go deeper into non-trivial lifetime scenarios.",
    points: [
      "Multiple lifetime params",
      "PhantomData use cases",
      "Self-referential struct limitations",
    ],
  },
  {
    title: "Unsafe Rust — Part 1",
    desc: "Work with Rust’s escape hatch safely.",
    points: [
      "unsafe keyword rules",
      "Raw pointers",
      "Dereferencing & safety invariants",
    ],
  },
  {
    title: "Unsafe Rust — Part 2",
    desc: "More advanced unsafe behavior.",
    points: [
      "Implementing your own smart pointer",
      "Manual memory management",
      "Pinning & `std::pin`",
    ],
  },
  {
    title: "Memory Layout",
    desc: "How Rust places things in memory.",
    points: [
      "repr(C), repr(Rust)",
      "Alignment rules",
      "Layout optimizations",
    ],
  },
  {
    title: "FFI — Calling C from Rust",
    desc: "Work with foreign libraries.",
    points: [
      "extern \"C\" functions",
      "Linking static/dynamic libs",
      "bindgen basics",
    ],
  },
  {
    title: "FFI — Calling Rust from C",
    desc: "Expose Rust functions outward.",
    points: [
      "#[no_mangle]",
      "C-compatible types",
      "Designing safe FFI layers",
    ],
  },
  {
    title: "Macros — Declarative",
    desc: "Build powerful compile-time transformations.",
    points: [
      "macro_rules!",
      "Pattern matching",
      "Metaprogramming patterns",
    ],
  },
  {
    title: "Macros — Procedural",
    desc: "Generate code with functions.",
    points: [
      "Function-like macros",
      "Derive macros",
      "Attribute macros",
    ],
  },
  {
    title: "Advanced Error Handling",
    desc: "Engineer better error flows.",
    points: [
      "Custom error enums",
      "thiserror deep usage",
      "Tracing failures with `anyhow`",
    ],
  },
  {
    title: "Smart Pointers — Advanced",
    desc: "Understand Rust’s rich pointer ecosystem.",
    points: ["Rc", "Arc", "Weak", "Interior mutability rules"],
  },
  {
    title: "Concurrency — Async Deep Dive",
    desc: "Beyond the basics.",
    points: [
      "Pin project",
      "Custom futures",
      "Async traits",
    ],
  },
  {
    title: "Concurrency — Sync Deep Dive",
    desc: "Fine control over threads.",
    points: [
      "mpsc channels",
      "Crossbeam",
      "Atomic primitives",
    ],
  },
  {
    title: "WASM — Part 1",
    desc: "Compile Rust to WebAssembly.",
    points: [
      "wasm-pack",
      "Basic bindings",
      "Browser integration",
    ],
  },
  {
    title: "WASM — Part 2",
    desc: "More WASM workflows.",
    points: [
      "wasm-bindgen advanced usage",
      "Optimizing size",
      "Interacting with JS efficiently",
    ],
  },
  {
    title: "Rust for CLI Tools",
    desc: "Engineer high-quality command-line tools.",
    points: [
      "clap and argh",
      "Colorized terminal output",
      "Efficient argument parsing",
    ],
  },
  {
    title: "Rust for Game Dev — Part 1",
    desc: "Game foundations.",
    points: [
      "Macroquad/bevy basics",
      "ECS fundamentals",
      "Asset loading",
    ],
  },
  {
    title: "Rust for Game Dev — Part 2",
    desc: "More advanced features.",
    points: [
      "Tilemaps",
      "Physics engines",
      "ECS systems & profiling",
    ],
  },
  {
    title: "Data Structures — Part 1",
    desc: "Low-level control with Rust.",
    points: [
      "Custom linked list",
      "Double-ended queue",
      "Memory-safe implementations",
    ],
  },
  {
    title: "Data Structures — Part 2",
    desc: "More complex structures.",
    points: [
      "Binary search tree",
      "Trie",
      "Arena allocation techniques",
    ],
  },
  {
    title: "Networking — Part 1",
    desc: "System-level networking.",
    points: ["TCP/UDP sockets", "tokio networking", "Async patterns"],
  },
  {
    title: "Networking — Part 2",
    desc: "More robust network systems.",
    points: ["Custom protocols", "Serialization", "Load testing"],
  },
  {
    title: "Serialization Formats",
    desc: "Work with structured data.",
    points: ["Serde advanced", "CBOR", "MessagePack"],
  },
  {
    title: "Database Interaction",
    desc: "Persistence and ORM usage.",
    points: ["sqlx basics", "Connection pools", "Async queries"],
  },
  {
    title: "Crate Design",
    desc: "Build professional Rust libraries.",
    points: [
      "Public API strategy",
      "Feature flags",
      "Documentation standards",
    ],
  },
  {
    title: "Profiling & Benchmarking",
    desc: "Optimize performance.",
    points: ["Criterion", "Perf", "Flamegraph"],
  },
  {
    title: "Memory Profiling",
    desc: "Understand memory usage deeply.",
    points: ["Valgrind massif", "DHAT", "Leaks & fragmentation"],
  },
  {
    title: "Compiler Internals",
    desc: "Learn how Rust processes your code.",
    points: [
      "hir/mir",
      "Borrow checker internals",
      "LLVM optimization pipeline",
    ],
  },
  {
    title: "Capstone Project",
    desc: "Apply all advanced topics.",
    points: [
      "Async server",
      "Game/engine module",
      "Custom compiler or interpreter",
    ],
  },
];
</script>

<style scoped>
.rust60-container {
  max-width: 750px;
  margin: auto;
  color: #eee;
  background: #1f1f1f;
  padding: 20px;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
}

.day-card {
  background: #262626;
  margin-bottom: 14px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.day-header {
  width: 100%;
  background: none;
  color: inherit;
  padding: 14px 16px;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  text-align: left;
}

.day-header:hover {
  background: #333333;
}

.arrow {
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.day-content {
  padding: 14px 20px;
  border-top: 1px solid #333;
}

ul {
  margin-top: 10px;
  padding-left: 22px;
}

li {
  margin-bottom: 6px;
}
</style>
