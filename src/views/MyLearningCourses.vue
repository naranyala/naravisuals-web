<template>
  <div class="app" :class="{dark: isDark, light: !isDark}">
    <header class="header">
      <button class="menu-btn" @click="menu=!menu">☰</button>
      <h1>{{title}}</h1>
      <div>
        <button class="theme-btn" @click="isDark=!isDark">{{isDark?'☀️':'🌙'}}</button>
        <span class="badge">{{pct}}%</span>
      </div>
    </header>

    <div class="layout">
      <nav class="sidebar" :class="{open:menu}">
        <div class="nav-items">
          <button v-for="t in tabs" :key="t"
            @click="active=t; lesson=null; menu=false" 
            :class="{active: active===t && !lesson}">{{t}}</button>
        </div>
        <div class="footer">
          <div class="bar"><div :style="{width: pct+'%'}"></div></div>
          <small>{{done.length}}/{{lessons.length}} done</small>
        </div>
      </nav>

      <main class="main">
        <div v-if="active==='Overview' && !lesson">
          <p class="desc">{{desc}}</p>
          <ul><li v-for="c in curriculum" :key="c">{{c}}</li></ul>
          <button class="btn primary" @click="active='Lessons'">Start →</button>
        </div>

        <div v-if="active==='Lessons' && !lesson">
          <div v-for="(l,i) in lessons" :key="l.id" class="item" @click="lesson=l">
            <span :class="['num', {done: done.includes(l.id)}]">
              {{done.includes(l.id)?'✓':i+1}}
            </span>
            <div><strong>{{l.title}}</strong><small>{{l.duration}}</small></div>
          </div>
        </div>

        <div v-if="lesson">
          <button class="back" @click="lesson=null">← Back</button>
          <h2>{{lesson.title}}</h2>
          <p class="content">{{lesson.content}}</p>
          <div class="actions">
            <button class="btn" :class="{done: done.includes(lesson.id)}" 
              @click="toggle(lesson.id)">
              {{done.includes(lesson.id)?'✓ Done':'Complete'}}
            </button>
            <button class="btn primary" v-if="idx<lessons.length-1" @click="lesson=next">
              Next →
            </button>
          </div>
        </div>
      </main>

      <div v-if="menu" class="overlay" @click="menu=false"></div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'

const menu = ref(false), active = ref('Overview'), lesson = ref(null)
const done = ref([]), isDark = ref(true)
const tabs = ['Overview', 'Lessons']
const title = 'Vue.js Fundamentals', desc = 'Learn Vue.js from scratch'
const curriculum = ['Intro', 'Components', 'State', 'Routing']
const lessons = [
  {id:0, title:'What is Vue?', duration:'12m', content:'Vue is a progressive framework...'},
  {id:1, title:'Components', duration:'18m', content:'Components are reusable Vue instances...'},
  {id:2, title:'State Management', duration:'22m', content:'Vue reactivity system...'},
  {id:3, title:'Routing', duration:'15m', content:'Vue Router enables SPA navigation...'}
]

const pct = computed(() => lessons.length ? Math.round((done.value.length/lessons.length)*100) : 0)
const idx = computed(() => lesson.value ? lessons.findIndex(l => l.id === lesson.value.id) : -1)
const next = computed(() => lessons[idx.value + 1])
const toggle = (id) => done.value = done.value.includes(id) 
  ? done.value.filter(l => l !== id) 
  : [...done.value, id]
</script>

<style>
.app.dark{--bg:#1a1a1a;--card:#252525;--text:#e0e0e0;--sec:#a0a0a0;--border:#444;--accent:#007aff}
.app.light{--bg:#f8f9fa;--card:#fff;--text:#212529;--sec:#6c757d;--border:#dee2e6;--accent:#007aff}

*{margin:0;padding:0;box-sizing:border-box}

.app{font-family:system-ui,sans-serif;min-height:100vh;background:var(--bg);color:var(--text)}

.header{display:flex;align-items:center;gap:1rem;padding:.75rem 1rem;background:var(--card);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:20}
.header h1{flex:1;font-size:1rem;font-weight:600}
.header>div{display:flex;align-items:center;gap:.5rem}

.menu-btn{display:none;background:none;border:none;font-size:1.25rem;cursor:pointer;color:var(--text);padding:.25rem}
.theme-btn{background:none;border:none;font-size:1rem;cursor:pointer;padding:.25rem}
.badge{font-size:.75rem;background:var(--accent);color:white;padding:.25rem .5rem;border-radius:4px}

.layout{display:flex;min-height:calc(100vh - 49px)}

.sidebar{width:180px;padding:1rem .75rem;background:var(--card);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:49px;height:calc(100vh - 49px)}
.nav-items{display:flex;flex-direction:column;gap:.25rem;flex:1}
.sidebar button{background:none;border:none;text-align:left;padding:.6rem .75rem;border-radius:6px;cursor:pointer;color:var(--sec);font-size:.9rem;transition:all .15s}
.sidebar button:hover{background:var(--bg);color:var(--text)}
.sidebar button.active{background:var(--accent);color:white}

.footer{padding-top:.75rem;border-top:1px solid var(--border);margin-top:auto}
.footer small{display:block;text-align:center;color:var(--sec);font-size:.7rem;margin-top:.4rem}
.bar{height:4px;background:var(--border);border-radius:2px;overflow:hidden}
.bar div{height:100%;background:var(--accent);transition:width .3s}

.main{flex:1;padding:1.5rem;max-width:700px}

.desc{color:var(--sec);font-size:.9rem;line-height:1.5;margin-bottom:1.25rem}

ul{list-style:none;display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.25rem}
ul li{font-size:.8rem;padding:.35rem .7rem;background:var(--card);border:1px solid var(--border);border-radius:4px}

.item{display:flex;align-items:center;gap:.75rem;padding:.75rem;background:var(--card);border:1px solid var(--border);border-radius:8px;margin-bottom:.5rem;cursor:pointer;transition:border-color .15s}
.item:hover{border-color:var(--accent)}
.num{width:28px;height:28px;background:var(--bg);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:600;color:var(--sec);flex-shrink:0}
.num.done{background:var(--accent);color:white}
.item>div{display:flex;flex-direction:column;min-width:0}
.item strong{font-size:.9rem}
.item small{color:var(--sec);font-size:.75rem}

.back{background:none;border:none;color:var(--sec);font-size:.85rem;cursor:pointer;margin-bottom:1rem}
.back:hover{color:var(--accent)}

h2{font-size:1.2rem;margin-bottom:1rem}

.content{font-size:.9rem;line-height:1.6;color:var(--sec);margin-bottom:1.5rem}

.actions{display:flex;gap:.5rem}

.btn{padding:.5rem 1rem;font-size:.85rem;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:6px;cursor:pointer;transition:all .15s}
.btn:hover{border-color:var(--accent)}
.btn.primary{background:var(--accent);color:white;border-color:var(--accent)}
.btn.done{background:var(--accent);color:white;border-color:var(--accent)}

.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:5}

@media (max-width:600px){
  .menu-btn{display:block}
  .sidebar{position:fixed;left:0;top:49px;bottom:0;width:200px;transform:translateX(-100%);transition:transform .2s;z-index:10}
  .sidebar.open{transform:translateX(0)}
  .overlay{display:block}
  .main{padding:1rem}
}
</style>
