
<template>
  <div class="docs-root">
    <!-- Header -->
    <header class="docs-header">
      <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">
        ☰
      </button>

      <div class="project">
        <strong>{{ project.name }}</strong>
        <span class="version">v{{ project.version }}</span>
      </div>

      <input
        class="search"
        placeholder="Search"
        v-model="search"
      />
    </header>

    <!-- Body -->
    <div class="docs-body">
      <!-- Sidebar -->
      <aside
        class="docs-sidebar"
        :class="{ open: sidebarOpen }"
      >
        <nav>
          <NavGroup
            v-for="group in filteredNav"
            :key="group.title"
            :group="group"
            @select="selectItem"
          />
        </nav>
      </aside>

      <!-- Backdrop (mobile) -->
      <div
        class="backdrop"
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
      />

      <!-- Content -->
      <main class="docs-content">
        <section v-if="current">
          <h1>{{ current.title }}</h1>

          <p class="brief">{{ current.brief }}</p>

          <section v-if="current.details">
            <h2>Detailed Description</h2>
            <p v-for="(p, i) in current.details" :key="i">
              {{ p }}
            </p>
          </section>

          <section v-if="current.members?.length">
            <h2>Members</h2>
            <table class="member-table">
              <tr
                v-for="m in current.members"
                :key="m.name"
              >
                <td class="member-name">{{ m.name }}</td>
                <td class="member-desc">{{ m.desc }}</td>
              </tr>
            </table>
          </section>
        </section>

        <section v-else class="empty">
          Select an item from the navigation tree.
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"

const project = { name: "MyLibrary", version: "1.0.0" }

const search = ref("")
const current = ref(null)
const sidebarOpen = ref(false)

const navigation = [
  {
    title: "Modules",
    items: [
      {
        title: "Core",
        brief: "Core utilities and primitives.",
        details: [
          "Fundamental building blocks.",
          "Dependency-free and stable."
        ],
        members: [
          { name: "init()", desc: "Initialize system." },
          { name: "shutdown()", desc: "Release resources." },
        ],
      },
    ],
  },
]

const filteredNav = computed(() => {
  if (!search.value) return navigation
  const q = search.value.toLowerCase()
  return navigation
    .map(g => ({
      ...g,
      items: g.items.filter(i =>
        i.title.toLowerCase().includes(q)
      ),
    }))
    .filter(g => g.items.length)
})

function selectItem(item) {
  current.value = item
  sidebarOpen.value = false
}
</script>

<script>
export default {
  components: {
    NavGroup: {
      props: ["group"],
      emits: ["select"],
      template: `
        <div class="nav-group">
          <div class="nav-title">{{ group.title }}</div>
          <ul>
            <li
              v-for="item in group.items"
              :key="item.title"
              @click="$emit('select', item)"
            >
              {{ item.title }}
            </li>
          </ul>
        </div>
      `,
    },
  },
}
</script>

<style>
/* ---------- base ---------- */
.docs-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #ddd;
  font-family: system-ui, sans-serif;
}

/* ---------- header ---------- */
.docs-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: #2a2a2a;
  border-bottom: 1px solid #333;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  color: #ddd;
  font-size: 1.2rem;
  cursor: pointer;
}

.project {
  display: flex;
  gap: 0.5rem;
}

.version {
  color: #999;
  font-size: 0.85em;
}

.search {
  margin-left: auto;
  background: #111;
  border: 1px solid #333;
  color: #ddd;
  padding: 0.35rem 0.6rem;
}

/* ---------- body ---------- */
.docs-body {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* ---------- sidebar ---------- */
.docs-sidebar {
  width: 260px;
  background: #252526;
  border-right: 1px solid #333;
  overflow-y: auto;
}

.nav-group {
  padding: 0.6rem;
}

.nav-title {
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.nav-group ul {
  list-style: none;
  padding-left: 0.5rem;
}

.nav-group li {
  padding: 0.3rem 0;
  cursor: pointer;
}

.nav-group li:hover {
  color: #4fc1ff;
}

/* ---------- content ---------- */
.docs-content {
  flex: 1;
  padding: 1rem 1.5rem;
  overflow-y: auto;
}

.brief {
  color: #bbb;
  font-style: italic;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
}

.member-table td {
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #333;
}

.member-name {
  width: 30%;
  color: #4fc1ff;
}

.empty {
  color: #777;
}

/* ---------- mobile ---------- */
.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .menu-btn {
    display: inline;
  }

  .docs-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: 10;
  }

  .docs-sidebar.open {
    transform: translateX(0);
  }

  .docs-content {
    padding: 1rem;
  }
}
</style>
