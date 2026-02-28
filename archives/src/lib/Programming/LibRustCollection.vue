<!-- App.vue -->
<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

const query = ref('');
const activeTab = ref('network');
const tabsContainer = ref(null);
const showLeftNav = ref(false);
const showRightNav = ref(true);

const scrollTabs = (direction) => {
  if (tabsContainer.value) {
    const scrollAmount = 200;
    tabsContainer.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }
};

const updateNavVisibility = () => {
  if (tabsContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainer.value;
    showLeftNav.value = scrollLeft > 0;
    showRightNav.value = scrollLeft < scrollWidth - clientWidth - 1;
  }
};

onMounted(() => {
  if (tabsContainer.value) {
    tabsContainer.value.addEventListener('scroll', updateNavVisibility);
    updateNavVisibility();
  }
});

onUnmounted(() => {
  if (tabsContainer.value) {
    tabsContainer.value.removeEventListener('scroll', updateNavVisibility);
  }
});

const tabs = [
  { id: 'network', label: 'Network programming' },
  { id: 'patterns', label: 'Rust patterns' },
  { id: 'algorithms', label: 'Algorithms' },
  { id: 'datastructures', label: 'Data structures' },
  { id: 'encoding', label: 'Encoding data' },
  { id: 'cryptography', label: 'Cryptography' },
  { id: 'async', label: 'Asynchronous' },
  { id: 'concurrency', label: 'Concurrency' },
  { id: 'devtools', label: 'Development tools' },
];

const packages = {
  network: [
    {
      name: 'sysinfo',
      desc: 'System information library for Rust',
      version: '0.30.5',
      downloads: '45M',
    },
    {
      name: 'tonic',
      desc: 'A native gRPC client & server implementation',
      version: '0.11.0',
      downloads: '12M',
    },
    {
      name: 'tower',
      desc: 'Modular reusable components for building robust clients and servers',
      version: '0.4.13',
      downloads: '38M',
    },
    {
      name: 'socket2',
      desc: 'Cross-platform utilities for creating and configuring sockets',
      version: '0.5.5',
      downloads: '92M',
    },
    {
      name: 'aws-config',
      desc: 'AWS SDK configuration and credentials',
      version: '1.1.0',
      downloads: '8M',
    },
    {
      name: 'ipnet',
      desc: 'IP network address manipulation',
      version: '2.9.0',
      downloads: '15M',
    },
  ],
  patterns: [
    {
      name: 'bitflags',
      desc: 'A macro to generate structures which behave like bitflags',
      version: '2.4.2',
      downloads: '185M',
    },
    {
      name: 'anyhow',
      desc: 'Flexible concrete Error type built on std::error::Error',
      version: '1.0.79',
      downloads: '156M',
    },
    {
      name: 'zerocopy',
      desc: 'Zero-cost safe transmutation of bytes to values',
      version: '0.7.32',
      downloads: '18M',
    },
    {
      name: 'http',
      desc: 'A set of types for representing HTTP requests and responses',
      version: '1.0.0',
      downloads: '98M',
    },
    {
      name: 'derive_more',
      desc: 'Convenient derive macros for the standard library traits',
      version: '0.99.17',
      downloads: '22M',
    },
  ],
  algorithms: [
    {
      name: 'rand',
      desc: 'Random number generation',
      version: '0.8.5',
      downloads: '145M',
    },
    {
      name: 'ahash',
      desc: 'A non-cryptographic hashing algorithm',
      version: '0.8.7',
      downloads: '78M',
    },
    {
      name: 'crc',
      desc: 'Cyclic Redundancy Check (CRC) implementation',
      version: '3.0.1',
      downloads: '12M',
    },
    {
      name: 'strsim',
      desc: 'String similarity metrics',
      version: '0.11.0',
      downloads: '45M',
    },
    {
      name: 'fastrand',
      desc: 'A simple and fast random number generator',
      version: '2.0.1',
      downloads: '52M',
    },
  ],
  datastructures: [
    {
      name: 'hashbrown',
      desc: "A Rust port of Google's high-performance SwissTable hash map",
      version: '0.14.3',
      downloads: '125M',
    },
    {
      name: 'indexmap',
      desc: 'Hash table with consistent order and fast iteration',
      version: '2.1.0',
      downloads: '95M',
    },
    {
      name: 'bitvec',
      desc: 'Addresses memory by bits, not bytes',
      version: '1.0.1',
      downloads: '8M',
    },
    {
      name: 'smallvec',
      desc: 'Small vector optimization',
      version: '1.13.1',
      downloads: '88M',
    },
    {
      name: 'ndarray',
      desc: 'N-dimensional arrays with array views',
      version: '0.15.6',
      downloads: '6M',
    },
  ],
  encoding: [
    {
      name: 'serde_json',
      desc: 'A JSON serialization file format',
      version: '1.0.111',
      downloads: '215M',
    },
    {
      name: 'base64',
      desc: 'Base64 encoding and decoding',
      version: '0.21.7',
      downloads: '142M',
    },
    {
      name: 'schemars',
      desc: 'Generate JSON Schemas from Rust code',
      version: '0.8.16',
      downloads: '5M',
    },
    {
      name: 'prost',
      desc: 'Protocol Buffers implementation',
      version: '0.12.3',
      downloads: '18M',
    },
    {
      name: 'toml',
      desc: 'TOML format support',
      version: '0.8.8',
      downloads: '35M',
    },
  ],
  cryptography: [
    {
      name: 'curve25519-dalek',
      desc: 'Pure-Rust implementation of group operations on Curve25519',
      version: '4.1.1',
      downloads: '28M',
    },
    {
      name: 'rustls',
      desc: 'Modern TLS library written in Rust',
      version: '0.22.2',
      downloads: '42M',
    },
    {
      name: 'blake3',
      desc: 'The BLAKE3 cryptographic hash function',
      version: '1.5.0',
      downloads: '8M',
    },
    {
      name: 'sha2',
      desc: 'SHA-2 family of hash functions',
      version: '0.10.8',
      downloads: '95M',
    },
    {
      name: 'rsa',
      desc: 'Pure Rust RSA implementation',
      version: '0.9.6',
      downloads: '12M',
    },
  ],
  async: [
    {
      name: 'tokio',
      desc: 'An event-driven, non-blocking I/O platform',
      version: '1.35.1',
      downloads: '168M',
    },
    {
      name: 'futures',
      desc: 'An implementation of futures and streams',
      version: '0.3.30',
      downloads: '135M',
    },
    {
      name: 'h2',
      desc: 'HTTP/2.0 client & server implementation',
      version: '0.4.0',
      downloads: '45M',
    },
    {
      name: 'tower-http',
      desc: 'Tower middleware and utilities for HTTP clients and servers',
      version: '0.5.1',
      downloads: '8M',
    },
    {
      name: 'async-io',
      desc: 'Async I/O and timers',
      version: '2.3.1',
      downloads: '15M',
    },
  ],
  concurrency: [
    {
      name: 'parking_lot',
      desc: 'More compact and efficient synchronization primitives',
      version: '0.12.1',
      downloads: '125M',
    },
    {
      name: 'spin',
      desc: 'Spin-based synchronization primitives',
      version: '0.9.8',
      downloads: '82M',
    },
    {
      name: 'rayon',
      desc: 'Simple work-stealing parallelism',
      version: '1.8.1',
      downloads: '42M',
    },
    {
      name: 'async-lock',
      desc: 'Async synchronization primitives',
      version: '3.3.0',
      downloads: '18M',
    },
    {
      name: 'crossbeam',
      desc: 'Tools for concurrent programming',
      version: '0.8.4',
      downloads: '38M',
    },
  ],
  devtools: [
    {
      name: 'tracing',
      desc: 'Application-level tracing for Rust',
      version: '0.1.40',
      downloads: '85M',
    },
    {
      name: 'criterion',
      desc: 'Statistics-driven micro-benchmarking library',
      version: '0.5.1',
      downloads: '5M',
    },
    {
      name: 'proptest',
      desc: 'Property testing framework',
      version: '1.4.0',
      downloads: '3M',
    },
    {
      name: 'insta',
      desc: 'Snapshot testing library',
      version: '1.34.0',
      downloads: '2M',
    },
    {
      name: 'cargo-edit',
      desc: 'Manage Cargo.toml dependencies from the command line',
      version: '0.12.2',
      downloads: '1M',
    },
  ],
};

const currentPackages = computed(() => packages[activeTab.value] || []);
</script>

<template>
  <div class="app">
    <div class="container">
      <h1>Lib.rs</h1>
      <p class="subtitle">
        Index of 220,295 Rust libraries and applications. Lightweight, opinionated, curated, unofficial alternative to crates.io.
        <a href="#">More...</a>
      </p>

      <!-- Search Bar -->
      <div class="search-bar">
        <input
          v-model="query"
          type="text"
          placeholder="name, keywords, description"
        />
        <button>Search</button>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs-wrapper">
        <button
          v-show="showLeftNav"
          class="nav-btn left"
          @click="scrollTabs('left')"
        >‹</button>
        <div class="tabs" ref="tabsContainer">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
        <button
          v-show="showRightNav"
          class="nav-btn right"
          @click="scrollTabs('right')"
        >›</button>
      </div>

      <!-- Package Grid -->
      <div class="grid">
        <div
          v-for="pkg in currentPackages"
          :key="pkg.name"
          class="card"
        >
          <div class="card-header">
            <h2>{{ pkg.name }}</h2>
            <span class="version">v{{ pkg.version }}</span>
          </div>
          <p class="desc">{{ pkg.desc }}</p>
          <div class="meta">
            <span class="downloads">📦 {{ pkg.downloads }} downloads</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  color: white;
  font-family: system-ui, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #cbd5e1;
  margin-bottom: 30px;
  font-size: 1.125rem;
}

.subtitle a {
  color: #60a5fa;
  text-decoration: none;
}

.subtitle a:hover {
  text-decoration: underline;
}

/* Search Bar */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.search-bar input {
  flex: 1;
  padding: 12px 16px;
  background: #475569;
  border: 1px solid #64748b;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.search-bar input::placeholder {
  color: #94a3b8;
}

.search-bar input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-bar button {
  padding: 12px 32px;
  background: #7c3aed;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.search-bar button:hover {
  background: #6d28d9;
}

/* Tabs */
.tabs-wrapper {
  position: relative;
  margin-bottom: 30px;
}

.nav-btn {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50px;
  background: linear-gradient(90deg, rgba(71, 85, 105, 0.95) 0%, rgba(71, 85, 105, 0.5) 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.nav-btn:hover {
  background: linear-gradient(90deg, rgba(71, 85, 105, 1) 0%, rgba(71, 85, 105, 0.7) 100%);
}

.nav-btn.left {
  left: 0;
  border-radius: 8px 0 0 8px;
  background: linear-gradient(90deg, rgba(71, 85, 105, 0.95) 0%, rgba(71, 85, 105, 0) 100%);
  padding-right: 10px;
}

.nav-btn.left:hover {
  background: linear-gradient(90deg, rgba(71, 85, 105, 1) 0%, rgba(71, 85, 105, 0) 100%);
}

.nav-btn.right {
  right: 0;
  border-radius: 0 8px 8px 0;
  background: linear-gradient(90deg, rgba(71, 85, 105, 0) 0%, rgba(71, 85, 105, 0.95) 100%);
  padding-left: 10px;
}

.nav-btn.right:hover {
  background: linear-gradient(90deg, rgba(71, 85, 105, 0) 0%, rgba(71, 85, 105, 1) 100%);
}

.tabs {
  display: flex;
  gap: 4px;
  background: rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  padding: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tabs button {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.tabs button:hover {
  background: rgba(71, 85, 105, 0.5);
}

.tabs button.active {
  background: #475569;
  color: white;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* Card */
.card {
  background: rgba(71, 85, 105, 0.4);
  border: 1px solid rgba(100, 116, 139, 0.5);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
}

.card:hover {
  background: rgba(71, 85, 105, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card h2 {
  color: #60a5fa;
  font-size: 1.25rem;
  margin: 0;
}

.version {
  color: #94a3b8;
  font-size: 0.875rem;
  font-family: monospace;
}

.desc {
  color: #cbd5e1;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.meta {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #94a3b8;
}

.downloads {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
