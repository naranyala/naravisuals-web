<template>
  <div class="rust30-container">
    <h1>30-Days Rust Programming Learning Plan</h1>

    <div v-for="(day, i) in days" :key="i" class="day-card">
      <button class="day-header" @click="toggle(i)">
        <span class="day-title">Day {{ i + 1 }} — {{ day.title }}</span>
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
    title: "Getting Started",
    desc: "Install toolchains and prepare your environment.",
    points: [
      "Install Rust using rustup",
      "Install VSCode + rust-analyzer",
      "Run first program with `cargo run`",
    ],
  },
  {
    title: "Rust Tooling",
    desc: "Understand Cargo and Rust tool ecosystem.",
    points: ["cargo new", "cargo build/test", "Workspace overview"],
  },
  {
    title: "Basic Syntax",
    desc: "Explore Rust’s structure and expression-based design.",
    points: ["Functions", "Blocks", "Expressions vs statements"],
  },
  {
    title: "Variables & Mutability",
    desc: "Learn bindings and mutability rules.",
    points: ["let vs mut", "Shadowing", "Type inference"],
  },
  {
    title: "Scalar & Compound Types",
    desc: "Study basic data types.",
    points: ["i32, f64, bool, char", "tuples", "arrays"],
  },
  {
    title: "Ownership — Part 1",
    desc: "Rust’s most crucial concept.",
    points: ["Move semantics", "Stack vs heap basics"],
  },
  {
    title: "Ownership — Part 2",
    desc: "Deeper into ownership mechanics.",
    points: ["Copy types", "Clone semantics"],
  },
  {
    title: "Borrowing — Part 1",
    desc: "Reference rules for safety.",
    points: ["& vs &mut", "Borrow checker basics"],
  },
  {
    title: "Borrowing — Part 2",
    desc: "Practical borrowing patterns.",
    points: ["Aliasing rules", "Reborrowing"],
  },
  {
    title: "Slices & Strings",
    desc: "Text and sequence slicing.",
    points: ["String vs &str", "UTF-8 considerations"],
  },
  {
    title: "Structs",
    desc: "Create custom data types.",
    points: ["Named struct", "Tuple struct", "Field update syntax"],
  },
  {
    title: "Enums",
    desc: "Sum types for expressive modeling.",
    points: ["Data-carrying enums", "Pattern matching"],
  },
  {
    title: "match Expression",
    desc: "Control flow using patterns.",
    points: ["Enums", "Guards", "Destructuring"],
  },
  {
    title: "Option & Result",
    desc: "Rust’s approach to null and errors.",
    points: ["Patterns", "unwrap vs expect", "? operator"],
  },
  {
    title: "Functions & Closures",
    desc: "Higher-order capabilities.",
    points: ["Fn/FnMut/FnOnce", "Move closures"],
  },
  {
    title: "Modules",
    desc: "Organize your Rust project.",
    points: ["mod, pub", "Visibility rules"],
  },
  {
    title: "Collections — Part 1",
    desc: "Standard library basics.",
    points: ["Vec", "VecDeque", "String"],
  },
  {
    title: "Collections — Part 2",
    desc: "More advanced structures.",
    points: ["HashMap", "HashSet", "BinaryHeap"],
  },
  {
    title: "Lifetimes — Part 1",
    desc: "Introduction to lifetime annotations.",
    points: ["'a syntax", "References in structs"],
  },
  {
    title: "Lifetimes — Part 2",
    desc: "Deep dive into lifetimes.",
    points: ["Subtyping", "Elision rules", "Function signatures"],
  },
  {
    title: "Traits — Part 1",
    desc: "Behavior abstraction.",
    points: ["Trait bounds", "Default methods"],
  },
  {
    title: "Traits — Part 2",
    desc: "More advanced abstractions.",
    points: ["Associated types", "Trait objects"],
  },
  {
    title: "Generics",
    desc: "Parametric polymorphism.",
    points: ["Generic structs", "Generic traits", "Monomorphization"],
  },
  {
    title: "Iterators",
    desc: "Functional-style iteration.",
    points: ["map, filter, fold", "IntoIterator trait"],
  },
  {
    title: "Error Handling",
    desc: "Robust & idiomatic error flows.",
    points: ["thiserror", "anyhow", "Custom error types"],
  },
  {
    title: "Concurrency — Part 1",
    desc: "Safe multithreading.",
    points: ["Arc", "Mutex", "Send + Sync"],
  },
  {
    title: "Concurrency — Part 2",
    desc: "Async programming.",
    points: ["tokio basics", "async/await", "Futures"],
  },
  {
    title: "File I/O",
    desc: "Work with files & streams.",
    points: ["std::fs", "BufReader/Writer", "CSV/JSON parsing"],
  },
  {
    title: "Testing",
    desc: "Write quality Rust code.",
    points: ["Unit tests", "Integration tests"],
  },
  {
    title: "Final Mini Project",
    desc: "Apply everything learned.",
    points: [
      "CLI tool",
      "Small game",
      "Simple async server",
    ],
  },
];
</script>

<style scoped>
.rust30-container {
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
