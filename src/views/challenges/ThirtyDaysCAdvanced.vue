<template>
  <div class="c60-container">
    <h1>Next 30 Days — Advanced C Programming (Day 31–60)</h1>

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

const toggle = (i) => {
  isOpen[i] = !isOpen[i];
};

const days = [
  {
    title: "Deep Pointer Exploration",
    desc: "Understand low-level pointer mechanics.",
    points: [
      "Pointer-to-pointer",
      "Memory aliasing",
      "Strict aliasing rule",
    ],
  },
  {
    title: "Function Pointers — Practical",
    desc: "Use functions as values.",
    points: [
      "Callbacks",
      "Event-style patterns",
      "Array of function pointers",
    ],
  },
  {
    title: "Pointer-based Data Structures",
    desc: "Manually model complex structures.",
    points: [
      "Linked lists deep dive",
      "Circular lists",
      "Doubly-linked lists",
    ],
  },
  {
    title: "Manual Memory Techniques",
    desc: "More advanced memory approaches.",
    points: [
      "Custom malloc wrappers",
      "Memory pools",
      "Arena allocators (simple version)",
    ],
  },
  {
    title: "Binary Tree Implementations",
    desc: "Build classical tree structures.",
    points: [
      "Insert/delete traversal",
      "Balance concepts",
      "Tree memory management",
    ],
  },
  {
    title: "Hash Tables in Pure C",
    desc: "Implement dynamic hashing.",
    points: [
      "Open addressing",
      "Separate chaining",
      "Resize strategy",
    ],
  },
  {
    title: "Sorting Algorithms — Deep Dive",
    desc: "Hands-on with performance.",
    points: [
      "Merge sort",
      "Quick sort",
      "Compare complexities",
    ],
  },
  {
    title: "Searching Algorithms",
    desc: "Classic techniques.",
    points: [
      "Binary search",
      "Interpolation search",
      "Search in 2D data",
    ],
  },
  {
    title: "Bitwise Manipulation — Part 1",
    desc: "Core low-level skills.",
    points: [
      "Masks",
      "Flags",
      "Toggle/clear/check bits",
    ],
  },
  {
    title: "Bitwise Manipulation — Part 2",
    desc: "Advanced tricks.",
    points: [
      "Set packing",
      "Bit-level optimizations",
      "High-performance use cases",
    ],
  },
  {
    title: "Memory Layout Internals",
    desc: "How C stores things.",
    points: [
      "Padding & alignment",
      "Struct packing rules",
      "Understanding offsetof",
    ],
  },
  {
    title: "C Runtime & ABI Concepts",
    desc: "What happens underneath.",
    points: [
      "Calling conventions",
      "Stack frames revisited",
      "Object file formats (ELF/COFF)",
    ],
  },
  {
    title: "Const-Correctness",
    desc: "Write safer, better APIs.",
    points: ["const propagation", "Pointers to const", "API design patterns"],
  },
  {
    title: "Volatile & Low-Level Hardware",
    desc: "When accessing memory-mapped registers.",
    points: [
      "volatile semantics",
      "When *not* to use volatile",
      "Simple fake driver example",
    ],
  },
  {
    title: "Multifile Large Project Structure",
    desc: "Organize big real-world apps.",
    points: ["Modules", "Opaque structs", "Internal headers"],
  },
  {
    title: "Advanced Preprocessor Usage",
    desc: "Generate code at compile-time.",
    points: ["Macro functions", "Stringizing", "Token-pasting"],
  },
  {
    title: "Generic Programming Techniques",
    desc: "Achieve type-generic patterns.",
    points: ["X-macros", "Void pointer utilities", "Macro-based generics"],
  },
  {
    title: "Error Handling Architectures",
    desc: "More systematic error flow.",
    points: ["Error codes", "Context objects", "Centralized error maps"],
  },
  {
    title: "Logging Systems in C",
    desc: "Build production-grade logs.",
    points: ["Log levels", "Log sinks", "Compile-time logging toggles"],
  },
  {
    title: "Serialization & Binary Protocols",
    desc: "Turn data into streams.",
    points: ["Struct packing", "Endian concerns", "Simple protocol framing"],
  },
  {
    title: "Process, OS, and Syscalls",
    desc: "Interact directly with the OS.",
    points: [
      "fork/exec basics",
      "File descriptors",
      "Signals",
    ],
  },
  {
    title: "POSIX Threads — Part 1",
    desc: "Get started with multithreading.",
    points: ["pthread_create", "Join", "Thread arguments"],
  },
  {
    title: "POSIX Threads — Part 2",
    desc: "Synchronization primitives.",
    points: ["Mutex", "Condition variable", "Spinlock patterns"],
  },
  {
    title: "Networking — Socket Basics",
    desc: "Write simple network programs.",
    points: ["TCP sockets", "Bind/listen/accept", "Client/server demo"],
  },
  {
    title: "Networking — Async Patterns",
    desc: "Boost networking performance.",
    points: ["select()", "poll()", "Nonblocking sockets"],
  },
  {
    title: "Compiler Optimization Flags",
    desc: "Let compilers tune your code.",
    points: ["-O1/2/3/s", "Inlining rules", "Optimization caveats"],
  },
  {
    title: "Linking & Compilation Pipeline",
    desc: "Understand the full process.",
    points: [
      "Preprocess → Compile → Assemble → Link",
      "Static vs dynamic linking",
    ],
  },
  {
    title: "Profiling & Performance Tools",
    desc: "Benchmark and optimize.",
    points: ["gprof", "Valgrind massif", "Microbenchmark patterns"],
  },
  {
    title: "Unit Testing in C",
    desc: "Increase reliability.",
    points: ["Test harness design", "Minimal assert framework"],
  },
  {
    title: "Final Systems Project",
    desc: "Build an advanced standalone program.",
    points: [
      "Custom memory manager",
      "Networking tool",
      "Terminal-based mini-engine",
    ],
  },
];
</script>

<style scoped>
.c60-container {
  max-width: 750px;
  margin: auto;
  color: #eee;
  background: #1d1d1d;
  padding: 20px;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
}

.day-card {
  background: #242424;
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
  background: #2c2c2c;
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
