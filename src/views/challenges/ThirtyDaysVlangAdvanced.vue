<template>
  <div class="v30-advanced-container">
    <h1>30-Days Advanced V Language</h1>

    <div v-for="(day, i) in days" :key="i" class="day-card">
      <button class="day-header" @click="toggle(i)">
        <span class="day-title">Day {{ i + 1 }} — {{ day.title }}</span>
        <span class="arrow" :class="{ open: isOpen[i] }">▾</span>
      </button>

      <div v-if="isOpen[i]" class="day-content">
        <p>{{ day.desc }}</p>
        <ul>
          <li v-for="(point, j) in day.points" :key="j">{{ point }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
/* ---------- state ---------- */
import { reactive } from 'vue'
const isOpen = reactive({})
const toggle = (i) => (isOpen[i] = !isOpen[i])

/* ---------- curriculum ---------- */
const days = [
  {
    title: 'Runtime Reflection',
    desc: 'Inspect types and values at runtime.',
    points: ['Type-of expressions', 'Field walking via reflection', 'Dynamic struct instantiation'],
  },
  {
    title: 'Comptime Code Generation',
    desc: 'Push V’s compile-time power to the limit.',
    points: ['\$for over fields', '\$if on constants', 'Generating whole structs / match arms'],
  },
  {
    title: 'Advanced Memory',
    desc: 'Arena allocators, pooling, zero-allocation patterns.',
    points: ['Bump allocators', 'Object pools', 'Tracking allocations with -d trace_malloc'],
  },
  {
    title: 'Lock-Free Concurrency',
    desc: 'High-performance parallel primitives.',
    points: ['Atomic<T> operations', 'Spinlocks vs mutexes', 'Lock-free queues'],
  },
  {
    title: 'Channel Internals & Select',
    desc: 'Deep dive into CSP implementation.',
    points: ['Buffered vs un-buffered', 'Select statement', 'Closing & broadcasting'],
  },
  {
    title: 'Parallelism with Rayon\'s Ideas',
    desc: 'Data-parallel work-stealing in userland.',
    points: ['Work-stealing deque', 'Parallel for & map', 'Benchmark vs sequential'],
  },
  {
    title: 'SIMD & Vectorisation',
    desc: 'Manual vector intrinsics and auto-vectorisation hints.',
    points: ['#flag -O3 -march=native', 'v.simd for basic ops', 'Writing inline LLVM intrinsics'],
  },
  {
    title: 'Inline Assembly & Cuda',
    desc: 'Drop to metal when needed.',
    points: ['asm volatile {}', 'Calling CUDA kernels', 'Mixing V with cuBLAS'],
  },
  {
    title: 'Foreign Function Interface (FFI) Mastery',
    desc: 'Zero-cost bindings to C/C++/Obj-C.',
    points: ['#flag -l, #include, #pkgconfig', 'Wrapping C++ templates', 'Callbacks from C to V'],
  },
  {
    title: 'Writing V Libraries',
    desc: 'Publish reusable packages.',
    points: ['v.mod metadata', 'Semantic versioning', 'Automated testing on CI'],
  },
  {
    title: 'Hot-Code Reloading',
    desc: 'Update running programs instantly.',
    points: ['-d reload flag', 'Struct layout stability', 'Practical dev-time workflow'],
  },
  {
    title: 'Custom Allocators in Practice',
    desc: 'Replace the global allocator.',
    points: ['Implementing Allocator interface', 'Stack-based transient alloc', 'Profiling with tracy'],
  },
  {
    title: 'Benchmarking & Profiling',
    desc: 'Find the real bottlenecks.',
    points: ['v -prod -profile', 'Perf, Hotspot, Tracy', 'Micro-benchmark pitfalls'],
  },
  {
    title: 'Code-Coverage & Fuzzing',
    desc: 'Automated quality assurance.',
    points: ['v -coverage', 'libFuzzer integration', 'Minimising crash inputs'],
  },
  {
    title: 'Cross-Compilation Deep Dive',
    desc: 'Ship for any OS/arch without Docker.',
    points: ['--target triple', 'Static musl builds', 'Stripping & UPX packing'],
  },
  {
    title: 'WebAssembly Edge',
    desc: 'Run V in the browser or on the edge.',
    points: ['v -b wasm', 'Exporting WASM32 APIs', 'Calling V from JS'],
  },
  {
    title: 'Advanced JSON / Message-Pack',
    desc: 'Custom (de)serialisers and streams.',
    points: ['json.RawDecode', 'Skip alloc streaming', 'Message-Pack zero-copy'],
  },
  {
    title: 'Networking — Custom TCP/UDP',
    desc: 'Build your own protocols.',
    points: ['net.TcpConn & UdpSocket', 'Epoll/kqueue wrappers', '100 k concurrent sockets'],
  },
  {
    title: 'TLS & QUIC Handshake',
    desc: 'Secure and fast transports.',
    points: ['openssl vs mbedtls', 'QUIC with mvquic', '0-RTT resumption'],
  },
  {
    title: 'Database Drivers Internals',
    desc: 'Write high-perf native drivers.',
    points: ['Binary protocol dissection', 'Connection pooling', 'Async query pipelining'],
  },
  {
    title: 'ORM & Query Builder',
    desc: 'Type-safe SQL without macros.',
    points: ['vsql generate', 'Struct tags for indices', 'Compile-time checked queries'],
  },
  {
    title: 'GraphQL Server',
    desc: 'Full-featured API layer.',
    points: ['Schema-first design', 'Resolvers with comptime', 'Subscription websockets'],
  },
  {
    title: 'Middleware & Plugin Architecture',
    desc: 'Extensible binary design.',
    points: ['Dynamic loading (dlopen)', 'Interface-based plugins', 'Hot-pluggable routes'],
  },
  {
    title: 'GUIs with ui Module',
    desc: 'Native cross-platform desktop apps.',
    points: ['Event loop integration', 'Custom widgets', 'Bundling resources'],
  },
  {
    title: 'OpenGL / Vulkan Bindings',
    desc: 'High-performance graphics.',
    points: ['GLFW windowing', 'Vulkan memory allocator', 'Dear ImGui wrappers'],
  },
  {
    title: 'Game Loop & ECS',
    desc: 'Entity-component-system in V.',
    points: ['Sparse sets', 'System scheduling', 'Cache-friendly archetypes'],
  },
  {
    title: 'Kernel / Bare-Metal',
    desc: 'Run V without an OS.',
    points: ['Freestanding -freestanding', 'Multiboot2 boot loader', 'Writing a mini printk'],
  },
  {
    title: 'Blockchain VM in V',
    desc: 'Build a tiny EVM-like machine.',
    points: ['Opcodes & gas metering', 'Merkle-Patricia trie', 'State snapshotting'],
  },
  {
    title: 'Machine-Learning Inference',
    desc: 'Load and run ONNX models.',
    points: ['ONNX-c runtime', 'Zero-copy tensor views', 'SIMD-accelerated ops'],
  },
  {
    title: 'Contributing to the Compiler',
    desc: 'Submit your first PR to vlang/v.',
    points: ['Reading checker/table.v', 'Adding a new attribute', 'Testing with v self'],
  },
  {
    title: 'Capstone — Real-World Project',
    desc: 'Ship a production-grade system.',
    points: ['Pick: DB, game, kernel module, ML service', 'CI/CD pipeline', 'Publish & gather feedback'],
  },
]
</script>

<style scoped>
/* identical styling to previous components */
.v30-advanced-container {
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
