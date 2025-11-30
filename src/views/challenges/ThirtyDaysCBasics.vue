<template>
  <div class="c30-container">
    <h1>30-Days C Programming Learning Plan</h1>

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
    title: "Introduction & Environment",
    desc: "Understand what C is and prepare your tools.",
    points: [
      "Install a compiler (GCC/Clang)",
      "Install VSCode or any editor",
      "Learn compile + run basics",
    ],
  },
  {
    title: "Basic Syntax",
    desc: "Study C structure and simple programs.",
    points: [
      "`main()` and return values",
      "Standard headers",
      "Simple I/O with printf/scanf",
    ],
  },
  {
    title: "Variables & Types",
    desc: "Numeric types, characters, and basic memory idea.",
    points: [
      "int, float, double, char",
      "Constants",
      "Type conversion rules",
    ],
  },
  {
    title: "Operators",
    desc: "Arithmetic, logical, relational, assignment.",
    points: [
      "+, -, *, /, %",
      "++, --",
      "Comparison operators",
    ],
  },
  {
    title: "Control Flow — If/Else",
    desc: "Build decision-making logic.",
    points: [
      "Nested if",
      "Common mistakes",
      "Mini exercises",
    ],
  },
  {
    title: "Switch Statements",
    desc: "Structured branching.",
    points: [
      "switch + case + break",
      "Fallthrough behavior",
    ],
  },
  {
    title: "Loops — For",
    desc: "Repetition fundamentals.",
    points: ["Classic loops", "Patterns printing", "Iterating arrays"],
  },
  {
    title: "Loops — While & Do-While",
    desc: "More flexible looping structures.",
    points: ["Infinite loops", "Input validation patterns"],
  },
  {
    title: "Functions — Basics",
    desc: "Break problems into small pieces.",
    points: ["Parameters", "Return values", "Naming style"],
  },
  {
    title: "Functions — Advanced",
    desc: "Deepen understanding.",
    points: ["Stack frame basics", "Call-by-value rules"],
  },
  {
    title: "Arrays — 1D",
    desc: "Store sequences of data.",
    points: ["Declaration", "Iteration", "Common bugs"],
  },
  {
    title: "Arrays — 2D",
    desc: "Matrices & multi-dimensional data.",
    points: ["Indexing", "Memory layout"],
  },
  {
    title: "Strings",
    desc: "Text handling in C.",
    points: ["Null terminator", "Common functions", "String pitfalls"],
  },
  {
    title: "Pointers — Basics",
    desc: "The heart of C programming.",
    points: ["Address-of", "Dereference", "Pointer types"],
  },
  {
    title: "Pointers — Deep Dive",
    desc: "More practical usage.",
    points: ["Pointer arithmetic", "Void pointers"],
  },
  {
    title: "Dynamic Memory (malloc/free)",
    desc: "Create and manage memory manually.",
    points: ["malloc/calloc/realloc", "Memory leaks", "Valgrind basics"],
  },
  {
    title: "Structures",
    desc: "Group related data.",
    points: ["Struct declaration", "Struct pointers", "Struct arrays"],
  },
  {
    title: "typedef & Enums",
    desc: "Custom types and enumerations.",
    points: ["Cleaner APIs", "Enum patterns"],
  },
  {
    title: "File I/O — Basics",
    desc: "Reading and writing simple files.",
    points: ["fopen/fclose", "fprintf/fscanf"],
  },
  {
    title: "File I/O — Advanced",
    desc: "Binary files and buffering.",
    points: ["fread/fwrite", "Buffer modes"],
  },
  {
    title: "Macros & Preprocessor",
    desc: "C’s compile-time features.",
    points: ["#define", "Conditional compilation"],
  },
  {
    title: "Header Files & Multi-File Project",
    desc: "Organize real programs.",
    points: [".h vs .c files", "Header guards"],
  },
  {
    title: "Debugging Tools",
    desc: "Find bugs efficiently.",
    points: ["gdb basics", "Common runtime errors"],
  },
  {
    title: "Memory Model Overview",
    desc: "How C organizes memory.",
    points: ["Stack/Heap/Static", "Segmentation faults"],
  },
  {
    title: "Makefiles",
    desc: "Automate building.",
    points: ["Targets", "Dependencies", "Variables"],
  },
  {
    title: "Basic Data Structures",
    desc: "Foundations for problem solving.",
    points: ["Linked lists", "Stacks", "Queues"],
  },
  {
    title: "Complex Data Structures",
    desc: "Tree structures in C.",
    points: ["Binary trees", "Dynamic allocation patterns"],
  },
  {
    title: "Practical Mini Projects",
    desc: "Apply everything learned.",
    points: ["CLI calculator", "Note manager", "Simple database"],
  },
  {
    title: "Performance Basics",
    desc: "Measure and optimize.",
    points: ["Time complexity", "Efficient loops"],
  },
  {
    title: "Final Capstone",
    desc: "Build one meaningful project.",
    points: ["C mini-engine", "File parser", "Game prototype"],
  },
];
</script>

<style scoped>
.c30-container {
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
