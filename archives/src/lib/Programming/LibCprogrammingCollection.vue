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
  { id: 'system', label: 'System programming' },
  { id: 'algorithms', label: 'Algorithms' },
  { id: 'datastructures', label: 'Data structures' },
  { id: 'parsing', label: 'Parsing & encoding' },
  { id: 'cryptography', label: 'Cryptography' },
  { id: 'graphics', label: 'Graphics & GUI' },
  { id: 'embedded', label: 'Embedded systems' },
  { id: 'database', label: 'Database & storage' },
];

const packages = {
  network: [
    {
      name: 'curl',
      desc: 'Command line tool and library for transferring data with URLs',
      version: '8.5.0',
      downloads: '2.8B',
    },
    {
      name: 'libuv',
      desc: 'Multi-platform asynchronous I/O library',
      version: '1.48.0',
      downloads: '850M',
    },
    {
      name: 'libmicrohttpd',
      desc: 'Small C library for embedding HTTP server functionality',
      version: '0.9.77',
      downloads: '125M',
    },
    {
      name: 'libevent',
      desc: 'Event notification library for developing scalable network servers',
      version: '2.1.12',
      downloads: '950M',
    },
    {
      name: 'mongoose',
      desc: 'Embedded web server library',
      version: '7.12',
      downloads: '68M',
    },
    {
      name: 'libwebsockets',
      desc: 'Lightweight C websockets library',
      version: '4.3.3',
      downloads: '42M',
    },
  ],
  system: [
    {
      name: 'glibc',
      desc: 'GNU C Library - core system library',
      version: '2.39',
      downloads: '5.2B',
    },
    {
      name: 'musl',
      desc: 'Lightweight standard C library',
      version: '1.2.4',
      downloads: '380M',
    },
    {
      name: 'libudev',
      desc: 'Library for device management in Linux',
      version: '255',
      downloads: '1.1B',
    },
    {
      name: 'libusb',
      desc: 'Cross-platform library for USB device access',
      version: '1.0.27',
      downloads: '520M',
    },
    {
      name: 'libiconv',
      desc: 'Character encoding conversion library',
      version: '1.17',
      downloads: '890M',
    },
  ],
  algorithms: [
    {
      name: 'gsl',
      desc: 'GNU Scientific Library - numerical computing routines',
      version: '2.7.1',
      downloads: '285M',
    },
    {
      name: 'libsodium',
      desc: 'Modern and easy-to-use crypto library',
      version: '1.0.19',
      downloads: '420M',
    },
    {
      name: 'xxHash',
      desc: 'Extremely fast non-cryptographic hash algorithm',
      version: '0.8.2',
      downloads: '156M',
    },
    {
      name: 'zlib',
      desc: 'General purpose data compression library',
      version: '1.3.1',
      downloads: '3.8B',
    },
    {
      name: 'bzip2',
      desc: 'High-quality data compression library',
      version: '1.0.8',
      downloads: '1.2B',
    },
  ],
  datastructures: [
    {
      name: 'uthash',
      desc: 'Hash table for C structures',
      version: '2.3.0',
      downloads: '95M',
    },
    {
      name: 'klib',
      desc: 'Standalone, lightweight C library of data structures',
      version: '1.0',
      downloads: '48M',
    },
    {
      name: 'sglib',
      desc: 'Generic library for C - lists, trees, hash tables',
      version: '1.0.4',
      downloads: '32M',
    },
    {
      name: 'c-algorithms',
      desc: 'Collection of common data structures and algorithms',
      version: '1.2.0',
      downloads: '28M',
    },
    {
      name: 'judy',
      desc: 'High-performance sparse dynamic array',
      version: '1.0.5',
      downloads: '15M',
    },
  ],
  parsing: [
    {
      name: 'jansson',
      desc: 'C library for encoding, decoding and manipulating JSON',
      version: '2.14',
      downloads: '285M',
    },
    {
      name: 'cJSON',
      desc: 'Ultra-lightweight JSON parser in ANSI C',
      version: '1.7.17',
      downloads: '420M',
    },
    {
      name: 'libxml2',
      desc: 'XML C parser and toolkit',
      version: '2.12.4',
      downloads: '1.8B',
    },
    {
      name: 'yajl',
      desc: 'Yet Another JSON Library - fast streaming JSON parser',
      version: '2.1.0',
      downloads: '125M',
    },
    {
      name: 'protobuf-c',
      desc: 'Protocol Buffers implementation in C',
      version: '1.5.0',
      downloads: '95M',
    },
  ],
  cryptography: [
    {
      name: 'openssl',
      desc: 'Full-featured toolkit for TLS and SSL protocols',
      version: '3.2.0',
      downloads: '4.5B',
    },
    {
      name: 'mbedtls',
      desc: 'Lightweight cryptographic and SSL/TLS library',
      version: '3.5.2',
      downloads: '380M',
    },
    {
      name: 'libgcrypt',
      desc: 'General purpose cryptographic library',
      version: '1.10.3',
      downloads: '650M',
    },
    {
      name: 'nacl',
      desc: 'High-speed cryptographic library',
      version: '20110221',
      downloads: '85M',
    },
    {
      name: 'bearssl',
      desc: 'Smaller SSL/TLS library implementation',
      version: '0.6',
      downloads: '42M',
    },
  ],
  graphics: [
    {
      name: 'cairo',
      desc: '2D graphics library with support for multiple output devices',
      version: '1.18.0',
      downloads: '1.2B',
    },
    {
      name: 'SDL2',
      desc: 'Simple DirectMedia Layer - cross-platform multimedia library',
      version: '2.30.0',
      downloads: '850M',
    },
    {
      name: 'stb',
      desc: 'Single-file public domain libraries for C/C++',
      version: '2024',
      downloads: '520M',
    },
    {
      name: 'raylib',
      desc: 'Simple and easy-to-use library to enjoy videogames programming',
      version: '5.0',
      downloads: '125M',
    },
    {
      name: 'nuklear',
      desc: 'Minimal state immediate mode GUI toolkit',
      version: '4.12.0',
      downloads: '68M',
    },
  ],
  embedded: [
    {
      name: 'FreeRTOS',
      desc: 'Real-time operating system kernel for embedded devices',
      version: '11.0.1',
      downloads: '2.1B',
    },
    {
      name: 'lwIP',
      desc: 'Lightweight TCP/IP stack for embedded systems',
      version: '2.2.0',
      downloads: '420M',
    },
    {
      name: 'CMSIS',
      desc: 'Cortex Microcontroller Software Interface Standard',
      version: '5.9.0',
      downloads: '680M',
    },
    {
      name: 'Contiki',
      desc: 'Operating system for IoT devices',
      version: '4.9',
      downloads: '85M',
    },
    {
      name: 'TinyUSB',
      desc: 'Open source cross-platform USB stack for embedded systems',
      version: '0.16.0',
      downloads: '95M',
    },
  ],
  database: [
    {
      name: 'SQLite',
      desc: 'Self-contained, serverless SQL database engine',
      version: '3.45.0',
      downloads: '5.8B',
    },
    {
      name: 'LMDB',
      desc: 'Lightning Memory-Mapped Database',
      version: '0.9.31',
      downloads: '285M',
    },
    {
      name: 'leveldb',
      desc: 'Fast key-value storage library',
      version: '1.23',
      downloads: '420M',
    },
    {
      name: 'Redis',
      desc: 'In-memory data structure store',
      version: '7.2.4',
      downloads: '3.2B',
    },
    {
      name: 'Berkeley DB',
      desc: 'High-performance embedded database library',
      version: '18.1.40',
      downloads: '650M',
    },
  ],
};

const currentPackages = computed(() => packages[activeTab.value] || []);
</script>

<template>
  <div class="app">
    <div class="container">
      <h1>CLib.dev</h1>
      <p class="subtitle">
        Index of popular C libraries and utilities. Lightweight, opinionated, curated collection of battle-tested C code.
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
