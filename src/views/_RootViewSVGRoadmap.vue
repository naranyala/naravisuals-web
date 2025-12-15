<template>
  <div class="wrap">
    <div class="map">
      <svg viewBox="0 0 800 500">
        <path v-for="c in conns" :key="c" :d="path(c)" :class="done[c[0]]?'on':'off'" />
      </svg>
      <div v-for="n in nodes" :key="n.id" 
           :class="['node', {done: done[n.id], sel: sel===n.id, lock: !open[n.id]}]"
           :style="{left: n.x/8+'%', top: n.y/5+'%'}"
           @click="sel=n.id">
        {{n.id}}
      </div>
    </div>
    
    <div class="info">
      <h3>{{cur.id}}</h3>
      <p>{{cur.txt}}</p>
      <button v-if="open[sel] && !done[sel]" @click="mark">✓ Done</button>
      <button v-else-if="done[sel]" @click="unmark">↺ Undo</button>
      <div v-else class="lock">🔒 Complete previous nodes</div>
      <div class="stat">{{Object.keys(done).length}} / {{nodes.length}}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const nodes = [
  {id:'C', x:100, y:250, txt:'Learn C fundamentals: pointers, memory, structs'},
  {id:'OS', x:250, y:150, txt:'Operating system concepts: processes, threads, syscalls'},
  {id:'ASM', x:250, y:350, txt:'Assembly language: x86/ARM, registers, instructions'},
  {id:'Mem', x:450, y:120, txt:'Memory management: heap, stack, malloc, free'},
  {id:'IPC', x:450, y:380, txt:'Inter-process communication: pipes, sockets, signals'},
  {id:'Drv', x:700, y:250, txt:'Device drivers: kernel modules, interrupt handlers'}
]

const conns = [['C','OS'],['C','ASM'],['OS','Mem'],['ASM','IPC'],['Mem','Drv'],['IPC','Drv']]

const sel = ref('C')
const done = ref({C:false})
const open = ref({C:true})

const cur = computed(() => nodes.find(n => n.id === sel.value))

const path = (c) => {
  const [f,t] = c.map(id => nodes.find(n => n.id === id))
  return `M${f.x},${f.y} C${f.x+100},${f.y} ${t.x-100},${t.y} ${t.x},${t.y}`
}

const mark = () => {
  done.value[sel.value] = true
  conns.filter(c => c[0] === sel.value).forEach(c => open.value[c[1]] = true)
}

const unmark = () => {
  done.value[sel.value] = false
  const lock = (id) => {
    conns.filter(c => c[0] === id).forEach(c => {
      open.value[c[1]] = false
      done.value[c[1]] = false
      lock(c[1])
    })
  }
  lock(sel.value)
}
</script>

<style scoped>
.wrap{display:flex;gap:1rem;padding:1rem;max-width:1200px;margin:0 auto;flex-wrap:wrap;}
.map{flex:1;min-width:300px;position:relative;aspect-ratio:8/5;max-width:800px;background:#0a0e1a;border-radius:8px; margin: 0 auto;}
svg{position:absolute;width:100vw;height:100%;pointer-events:none; margin: 0 auto;}
path{stroke-width:2;fill:none;transition:.3s}
.off{stroke:#333;stroke-dasharray:5,3}
.on{stroke:#0f0}
.node{position:absolute;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#1a1f2e;border:2px solid #444;color:#aaa;font-size:10px;font-weight:bold;cursor:pointer;transform:translate(-50%,-50%);transition:.2s}
.node:hover{transform:translate(-50%,-50%) scale(1.1)}
.node.done{background:#0a5;border-color:#0f0;color:#fff}
.node.sel{border-color:#fa0;box-shadow:0 0 0 3px #fa05}
.node.lock{opacity:.5;cursor:not-allowed}
.info{width:100vw;background:#1a1f2e;padding:1.5rem;border-radius:8px;color:#ddd}
.info h3{margin:0 0 1rem;color:#fff}
.info p{margin:0 0 1rem;line-height:1.5;color:#aaa}
button{width:100%;padding:.6rem;border:none;border-radius:6px;font-weight:bold;cursor:pointer;margin-bottom:.5rem}
button:first-of-type{background:#0a5;color:#fff}
button:nth-of-type(2){background:#666;color:#fff}
.lock{text-align:center;padding:.6rem;background:#333;border-radius:6px;color:#888;font-size:.9rem}
.stat{text-align:center;margin-top:1rem;padding-top:1rem;border-top:1px solid #333;color:#0f0;font-weight:bold}
</style>
