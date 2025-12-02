<template>
  <div class="v30-container">
    <h1>30-Days V Language Learning Plan</h1>

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
    title: "Introduction & Setup",
    desc: "Learn what V is and set up your environment.",
    points: [
      "Install V compiler from source or release",
      "Set up VSCode with V extension",
      "Compile and run a simple V program",
    ],
  },
  {
    title: "Basic Syntax & Structure",
    desc: "Understand V’s clean syntax and program structure.",
    points: [
      "fn main() and module structure",
      "Immutable by default",
      "Println and input basics",
    ],
  },
  {
    title: "Variables & Constants",
    desc: "Explore V’s type system and variable declarations.",
    points: [
      "let vs mut",
      "Basic types: int, f64, string, bool",
      "Type inference",
    ],
  },
  {
    title: "Operators & Expressions",
    desc: "Arithmetic, logical, and comparison operators.",
    points: [
      "+, -, *, /, %",
      "&&, ||, !",
      "Comparison and assignment",
    ],
  },
  {
    title: "Control Flow — If/Else",
    desc: "Make decisions in your programs.",
    points: [
      "if/else syntax",
      "Short if statements",
      "Match expressions",
    ],
  },
  {
    title: "Loops",
    desc: "Iterate with for loops.",
    points: [
      "for-in with arrays and maps",
      "Traditional for loop",
      "Break and continue",
    ],
  },
  {
    title: "Functions",
    desc: "Reusable blocks of code.",
    points: [
      "Function syntax",
      "Return values",
      "Multiple return values",
    ],
  },
  {
    title: "Arrays & Slices",
    desc: "Work with collections of data.",
    points: [
      "Array declaration",
      "Slices and their power",
      "Array methods",
    ],
  },
  {
    title: "Maps",
    desc: "Key-value storage in V.",
    points: [
      "Map syntax",
      "Insert, update, delete",
      "Iterate over maps",
    ],
  },
  {
    title: "Strings in Depth",
    desc: "Text manipulation and common operations.",
    points: [
      "String interpolation",
      "String methods",
      "Runes and Unicode",
    ],
  },
  {
    title: "Structs",
    desc: "Define custom data types.",
    points: [
      "Struct syntax",
      "Struct methods",
      "Embedding structs",
    ],
  },
  {
    title: "Access Modifiers",
    desc: "Control visibility of functions and structs.",
    points: [
      "pub vs private",
      "Module organization",
      "Importing modules",
    ],
  },
  {
    title: "Enums & Sum Types",
    desc: "Define custom enumerations and variants.",
    points: [
      "enum syntax",
      "Match with enums",
      "Sum types and type safety",
    ],
  },
  {
    title: "Option/Result Types",
    desc: "Handle errors and missing values.",
    points: [
      "Option type",
      "Result type",
      "Or block and error propagation",
    ],
  },
  {
    title: "File I/O",
    desc: "Read and write files.",
    points: [
      "os.read_file()",
      "os.write_file()",
      "Buffered I/O",
    ],
  },
  {
    title: "JSON Handling",
    desc: "Encode and decode JSON.",
    points: [
      "json.encode()",
      "json.decode()",
      "Struct tags for JSON",
    ],
  },
  {
    title: "Testing",
    desc: "Write and run tests.",
    points: [
      "Test functions",
      "assert statements",
      "Run tests with v test",
    ],
  },
  {
    title: "Concurrency Basics",
    desc: "Run code concurrently.",
    points: [
      "go fn() syntax",
      "Channels for communication",
      "Shared concurrency safety",
    ],
  },
  {
    title: "Memory Management",
    desc: "Understand V’s memory model.",
    points: [
      "No garbage collector",
      "Automatic memory freeing",
      "Ownership basics",
    ],
  },
  {
    title: "Closures & Anonymous Functions",
    desc: "Use functions as values.",
    points: [
      "Closure syntax",
      "Capturing variables",
      "Passing functions as args",
    ],
  },
  {
    title: "Interfaces",
    desc: "Define behavior contracts.",
    points: [
      "Interface syntax",
      "Implementing interfaces",
      "Dynamic dispatch",
    ],
  },
  {
    title: "Generics",
    desc: "Write reusable code with type parameters.",
    points: [
      "Generic structs",
      "Generic functions",
      "Constraints and usage",
    ],
  },
  {
    title: "Attributes & Decorators",
    desc: "Use V’s compile-time attributes.",
    points: [
      "[deprecated]",
      "[inline]",
      "Custom attributes",
    ],
  },
  {
    title: "Calling C Code",
    desc: "Interoperability with C libraries.",
    points: [
      "#flag and #include",
      "C function declarations",
      "Passing data between V and C",
    ],
  },
  {
    title: "Building CLI Tools",
    desc: "Create command-line utilities.",
    points: [
      "os.args",
      "Flag parsing",
      "Color output and prompts",
    ],
  },
  {
    title: "Web Development Basics",
    desc: "Build simple web apps.",
    points: [
      "vweb framework",
      "Routing and handlers",
      "HTML templating",
    ],
  },
  {
    title: "Cross-Platform Builds",
    desc: "Compile for multiple targets.",
    points: [
      "Cross-compilation flags",
      "Target OS and arch",
      "Static linking",
    ],
  },
  {
    title: "Performance Tips",
    desc: "Write fast and efficient V code.",
    points: [
      "Benchmarking",
      "Avoiding allocations",
      "Profiling tools",
    ],
  },
  {
    title: "Final Project",
    desc: "Build a complete V application.",
    points: [
      "Choose a project idea",
      "Plan and structure code",
      "Publish on GitHub",
    ],
  },
];
</script>

<style scoped>
.v30-container {
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
