import { animate, stagger, inView, scroll } from 'motion'
import { styled } from 'goober'
import { ref, computed, onMounted, nextTick } from 'vue'

// ── Goober styles (unchanged) ─────────────────────────────────────
const styles = {
  container: { minHeight: '100vh', bg: '#0d1117', color: '#c9d1d9', fontFamily: 'ui-monospace, Menlo, monospace', p: '2rem 1rem' },
  header: { textAlign: 'center', mb: '3rem' },
  title: { fontSize: '3.5rem', bgGradient: '90deg, #ffa500, #ff6b6b, #8b5cf6', bgClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: 800 },
  search: { maxWidth: '500px', mx: 'auto', mb: '3rem', p: '1rem', borderRadius: '12px', border: '1px solid #30363d', bg: '#161b22', color: 'white', fontSize: '1.1rem' },
  grid: { display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', maxWidth: '1400px', mx: 'auto' },
  card: { bg: '#161b22', border: '1px solid #30363d', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  cardHeader: (color) => ({ bg: color, p: '1rem 1.5rem', fontWeight: 'bold', fontSize: '1.3rem', color: 'white' }),
  commandItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '0.9rem 1.5rem', borderBottom: '1px solid #30363d', transition: 'background 0.2s', _hover: { bg: '#21262d' }, '&:last-child': { borderBottom: 'none' } },
  cmd: { fontWeight: 'bold', color: '#58a6ff' },
  desc: { color: '#8b949e', fontSize: '0.95rem' },
  copyBtn: { bg: '#21262d', border: '1px solid #30363d', color: '#58a6ff', px: '0.8rem', py: '0.4rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', _hover: { bg: '#30363d' } },
}

// ── Data & Search (unchanged) ─────────────────────────────────────
const search = ref('')
const categories = [ /* ← same array as before (omitted for brevity) */ ]

const filtered = computed(() => {
  if (!search.value) return categories
  const q = search.value.toLowerCase()
  return categories
    .map(cat => ({
      ...cat,
      commands: cat.commands.filter(c =>
        c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
      )
    }))
    .filter(cat => cat.commands.length > 0)
})

const copyToClipboard = (text) => navigator.clipboard.writeText(text)

// ── Motion One Vanilla JS Animations ───────────────────────────────
onMounted(() => {
  // Header entrance
  animate('.header', { opacity: [0, 1], y: [-50, 0] }, { duration: 0.6, easing: 'ease-out' })

  // Cards stagger in view
  inView('.card', (info) => {
    animate(
      info.target.querySelectorAll('li'),
      { opacity: [0, 1], x: [-30, 0] },
      { delay: stagger(0.05), duration: 0.4 }
    )
    animate(info.target, { opacity: [0, 1], scale: [0.94, 1] }, { duration: 0.5 })
    return () => { /* cleanup optional */ }
  })

  // Hover micro-interaction on each command row
  document.querySelectorAll('.command-item').forEach(el => {
    el.addEventListener('mouseenter', () => animate(el, { x: 8 }, { duration: 0.2 }))
    el.addEventListener('mouseleave', () => animate(el, { x: 0 }, { duration: 0.2 }))
  })
})
</script>

<template jsx>
  <div style={styles.container}>
    {/* Header */}
    <div class="header" style={styles.header}>
      <h1 style={styles.title}>Git Cheat Sheet</h1>
      <p style={{ color: '#8b949e', fontSize: '1.3rem' }}>
        The only Git sheet you'll ever need (with copy buttons!)
      </p>
    </div>

    {/* Search */}
    <input
      v-model={search}
      placeholder="Search commands… (rebase, stash, reset, etc.)"
      style={styles.search}
    />

    {/* Cards Grid */}
    <div style={styles.grid}>
      {filtered.map(cat => (
        <div key={cat.title} class="card" style={styles.card}>
          <div style={styles.cardHeader(cat.color)}>{cat.title}</div>
          <ul style={{ m: 0, p: 0 }}>
            {cat.commands.map(c => (
              <li key={c.cmd} class="command-item" style={styles.commandItem}>
                <div>
                  <code style={styles.cmd}>{c.cmd}</code>
                  <div style={styles.desc}>{c.desc}</div>
                </div>
                <button
                  style={styles.copyBtn}
                  onClick={() => copyToClipboard(c.cmd)}
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {filtered.length === 0 && (
      <p style={{ textAlign: 'center', fontSize: '1.5rem', mt: '4rem' }}>
        No commands found
      </p>
    )}
  </div>
