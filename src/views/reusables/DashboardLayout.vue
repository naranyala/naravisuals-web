<template>
  <div class="app" :class="{ 'sidebar-open': sidebarOpen }">
    <!-- overlay (mobile) -->
    <div
      v-if="sidebarOpen"
      class="overlay"
      @click="close"
      aria-hidden="true"
    />

    <!-- sidebar -->
    <aside :class="{ open: sidebarOpen }" role="navigation" aria-label="Main">
      <div class="logo">Dash</div>

      <nav>
        <a href="#" @click.prevent="close" class="active">⌂ Home</a>
        <a href="#" @click.prevent="close">⟡ Analytics</a>
        <a href="#" @click.prevent="close">◉ Profile</a>
        <a href="#" @click.prevent="close">⚷ Settings</a>
      </nav>

      <a href="#" @click.prevent="close" class="logout">↳ Logout</a>
    </aside>

    <!-- main -->
    <div class="main">
      <header>
        <button class="menu" @click="toggle" aria-label="Toggle menu">☰</button>
        <h1>Dashboard</h1>
        <div class="avatar" title="User">G</div>
      </header>

      <main>
        <section class="grid" aria-label="Key metrics">
          <article v-for="m in metrics" :key="m.id" class="card" :aria-label="m.label">
            <div class="value">{{ m.value.toLocaleString() }}</div>
            <div class="label">{{ m.label }}</div>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const sidebarOpen = ref(false)
const toggle = () => (sidebarOpen.value = !sidebarOpen.value)
const close = () => (sidebarOpen.value = false)

const onKey = (e) => {
  if (e.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const metrics = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  label: `Metric ${i + 1}`,
  value: (i + 1) * 1427
}))
</script>

<style scoped>
:root{
  --bg: #0b0b0b;
  --surface: #111;
  --muted: #9aa0a6;
  --text: #e6e7e8;
  --accent: #0a84ff;
  --card: #151515;
  --border: #222;
}

*{box-sizing:border-box;margin:0;padding:0}
.app{min-height:100dvh;display:flex;background:var(--bg);color:var(--text);font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:40}

/* sidebar */
aside{
  width:220px;background:var(--surface);border-right:1px solid var(--border);
  display:flex;flex-direction:column;position:fixed;top:0;bottom:0;left:0;z-index:50;
  transform:translateX(0);transition:transform .28s ease
}
@media (max-width:767px){
  aside{transform:translateX(-100%) ;width:78%}
  aside.open{transform:translateX(0)}
}
@media (min-width:768px){
  aside{position:static;height:100vh}
}

.logo{padding:1.25rem 1rem;font-weight:800;border-bottom:1px solid var(--border)}

nav{flex:1;display:flex;flex-direction:column;padding:.5rem 0}
a{display:block;padding:.85rem 1.25rem;color:var(--muted);text-decoration:none;font-weight:500;transition:all .14s}
a:hover, a:focus{background:rgba(255,255,255,.02);color:var(--text)}
a.active{color:var(--text);background:rgba(10,132,255,.07);border-left:3px solid var(--accent)}
.logout{padding:1rem 1.25rem;border-top:1px solid var(--border);color:#ff6b6b;text-decoration:none}

/* main */
.main{flex:1;display:flex;flex-direction:column;margin-left:220px}
@media (max-width:767px){.main{margin-left:0}}

header{height:64px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 1rem;gap:1rem;position:sticky;top:0;z-index:30}
.menu{background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--muted);display:none}
@media (max-width:767px){.menu{display:inline-block}}
header h1{font-size:1.1rem;font-weight:600}
.avatar{margin-left:auto;width:36px;height:36px;background:var(--accent);border-radius:50%;display:grid;place-items:center;font-weight:700}

/* content */
main{padding:1.5rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
.card{background:var(--card);border-radius:10px;padding:1rem;border:1px solid var(--border);transition:transform .18s,border-color .18s}
.card:hover{transform:translateY(-4px);border-color:var(--accent)}
.value{font-size:1.6rem;font-weight:700;color:var(--text)}
.label{margin-top:.4rem;font-size:.9rem;color:var(--muted)}
</style>
