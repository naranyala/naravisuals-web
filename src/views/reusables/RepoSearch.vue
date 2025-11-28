<template>
  <div class="search-card">
    <select v-model="provider" class="input">
      <option disabled value="">Choose provider…</option>
      <option v-for="p in providers" :key="p.id" :value="p.id">
        {{ p.label }}
      </option>
    </select>

    <input
      v-model="query"
      class="input"
      placeholder="Search the web..."
      @keydown.enter="performSearch"
    />

    <button class="search-btn" @click="performSearch">
      <span class="icon">🔍</span>
      <span>Search</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue"

const provider = ref("")
const query = ref("")

const providers = [
  {
    id: "nix",
    label: "Nix Packages",
    buildUrl: q => `https://search.nixos.org/packages?query=${encodeURIComponent(q)}`
  },
  {
    id: "brew",
    label: "Homebrew Formulae",
    buildUrl: q => `https://formulae.brew.sh/search/?q=${encodeURIComponent(q)}`
  },
  {
    id: "crates",
    label: "Crates.io",
    buildUrl: q => `https://crates.io/search?q=${encodeURIComponent(q)}`
  },
  {
    id: "github",
    label: "GitHub Repositories",
    buildUrl: q => `https://github.com/search?q=${encodeURIComponent(q)}&type=repositories`
  }
]

function performSearch() {
  if (!provider.value || !query.value.trim()) return
  const p = providers.find(x => x.id === provider.value)
  window.open(p.buildUrl(query.value), "_blank")
}
</script>

<style scoped>
/* main card container */
.search-card {
  background: #1b1b1b;
  border-radius: 14px;
  padding: 1.2rem;
  width: 380px;
  margin: 2rem auto;
  box-shadow: 0 2px 15px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

/* shared input & select style */
.input {
  width: 100%;
  background: #262626;
  color: #e4e4e4;
  border: 1px solid #3a3a3a;
  border-radius: 10px;
  padding: 0.75rem;
  outline: none;
  font-size: 0.95rem;
  transition: border 0.3s, background 0.3s;
}

.input:hover {
  background: #2c2c2c;
}

.input:focus {
  border-color: #7f5bff;
  background: #2d2d2d;
}

/* search button */
.search-btn {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  color: white;
  font-weight: 500;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;

  background: linear-gradient(90deg, #6a0fff, #b54fff);
  transition: opacity 0.2s, transform 0.1s;
}

.search-btn:hover {
  opacity: 0.92;
}

.search-btn:active {
  transform: scale(0.97);
}

/* icon styling */
.icon {
  font-size: 1.1rem;
  opacity: 0.9;
}
</style>

