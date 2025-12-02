<script setup>
import { ref, nextTick, watch } from 'vue'

// import ScrollToBottom from "./ScrollToBottom.vue"
import SlidingUpDrawer from "./SlidindUpDrawer.vue"

import Calculator from "../exploration_games/Calculator.vue"
import Breakout from "../exploration_games/Breakout.vue"
import Snake from "../exploration_games/Snake.vue"
import Sudoku from "../exploration_games/Sudoku.vue"


import Dropdown from './Dropdown.vue';

const dropdownOptions = ref([
  { label: 'future-of-me', value: 'future-of-me' },
  { label: 'present-of-me', value: 'present-of-me' },
  { label: 'past-of-me', value: 'past-of-me' },
]);

const handleSelect = (option) => {
  console.log('Selected:', option);
};

const open = ref(false)
const history = ref([])
const cmd = ref('')
const light = ref(false)
const inputRef = ref(null)
const outputRef = ref(null)
const startTime = Date.now()
const cmdHistory = ref([])
let histIdx = -1

const SITE_TITLE = ref("NARAVISUALS-WEB")
// const PROMPT_SYMBOL = ref("$")
const PROMPT_SYMBOL = ref(">")

watch(open, (val) => {
  if (val) nextTick(() => inputRef.value?.focus())
})

const isCalculatorVisible = ref(false)
const isBreakoutVisible = ref(false)
const isSnakeVisible = ref(false)
const isSudokuVisible = ref(false)

const commands = {
  play_sudoku: () => isSudokuVisible.value = true,
  play_snake: () => isSnakeVisible.value = true,
  play_breakout: () => isBreakoutVisible.value = true,
  use_calculator: () => isCalculatorVisible.value = true,
  work: () => out("hire me! fast"),
  info: () => {
    const info = {
      name: "Fudzer M Huda",
      degree: "Information System Bachelor"
    }

    out(JSON.stringify(info, null, 2));
  },
  help: () => out(Object.keys(commands).join(', ')),
  clear: () => history.value = [],
  close: () => open.value = false,
  time: () => out(new Date().toLocaleTimeString()),
  date: () => out(new Date().toLocaleDateString()),
  uptime: () => {
    const s = Math.floor((Date.now() - startTime) / 1000)
    const m = Math.floor(s / 60)
    out(m > 0 ? `${m}m ${s % 60}s` : `${s}s`)
  },
  whoami: () => out('guest@terminal'),
  theme: (args) => {
    if (args[0] === 'light') light.value = true
    else if (args[0] === 'dark') light.value = false
    else out('usage: theme [dark/light]')
  },
  calc: (args) => {
    try {
      const expr = args.join('').replace(/[^0-9+\-*/.()]/g, '')
      out(String(eval(expr)))
    } catch { out('invalid expression') }
  },
  hello: () => out('Hello! 👋'),
  flip: () => out(Math.random() > 0.5 ? 'heads' : 'tails'),
  dice: () => out(String(Math.floor(Math.random() * 6) + 1)),
  fortune: () => {
    const q = ['Keep it simple.', 'Stay curious.', 'Done is better than perfect.', 'Think different.', 'Start now.']
    out(q[Math.floor(Math.random() * q.length)])
  },
  matrix: () => {
    let i = 0
    const iv = setInterval(() => {
      if (i++ > 5) return clearInterval(iv)
      let line = ''
      for (let j = 0; j < 30; j++) line += Math.round(Math.random())
      out(`<span style="color:#0f0">${line}</span>`)
    }, 100)
  },
  show_profile: () => {
    location.replace('/profile');
  }
}

function out(content, type = '') {
  history.value.push({ content, type, showPrompt: false })
  nextTick(() => outputRef.value && (outputRef.value.scrollTop = outputRef.value.scrollHeight))
}

function exec() {
  const input = cmd.value.trim()
  if (!input) return
  cmdHistory.value.push(input)
  if (cmdHistory.value.length > 50) cmdHistory.value.shift()
  histIdx = cmdHistory.value.length
  history.value.push({ content: input, type: 'cmd', showPrompt: true })
  const [name, ...args] = input.split(' ')
  const c = commands[name]
  if (c) c(args)
  else out(`unknown: ${name}`, 'err')
  cmd.value = ''
}

function onKey(e) {
  if (e.key === 'Enter') { e.preventDefault(); exec() }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (cmdHistory.value.length && histIdx > 0) { histIdx--; cmd.value = cmdHistory.value[histIdx] }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (histIdx < cmdHistory.value.length - 1) { histIdx++; cmd.value = cmdHistory.value[histIdx] }
    else { histIdx = cmdHistory.value.length; cmd.value = '' }
  } else if (e.key === 'Escape') { open.value = false }
}

function focusInput() { inputRef.value?.focus() }

defineExpose({ out, register: (n, fn) => commands[n] = fn })
</script>

<template>
  <div class="wrapper" :class="{ light }">
    <!-- Sticky Header (navbar + terminal) -->
    <header class="sticky-header">
      <nav class="navbar">
        <a href="/" class="logo">{{ SITE_TITLE }}</a>

        <!-- separator -->

        <button @click="open = !open" style="border: none;">
          <svg v-if="open" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <path fill="currentColor"
              d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12" />
            <path fill="currentColor"
              d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z" />
          </svg>
          <svg v-if="!open" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="m6.75 7.5l3 2.25l-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25" />
          </svg>
        </button>

        <!-- <ScrollToBottom style="margin-right: 5px;" /> -->

        <Dropdown :options="dropdownOptions" placeholder="MODE" @select="handleSelect" />

      </nav>

      <!-- Terminal Panel -->
      <div class="terminal" :class="{ open }" @click="focusInput">
        <div class="output" ref="outputRef">
          <div v-for="(e, i) in history" :key="i" :class="['line', e.type]">
            <span v-if="e.showPrompt" class="prompt">{{ PROMPT_SYMBOL }}</span>
            <span v-html="e.content"></span>
          </div>
          <div class="line input">
            <span class="prompt">{{ PROMPT_SYMBOL }}</span>
            <input ref="inputRef" v-model="cmd" @keydown="onKey" autocomplete="off" spellcheck="false"
              placeholder="type help" />
            <button @click="exec">RUN</button>
          </div>
        </div>
      </div>
    </header>

    <Teleport to="body">
      <SlidingUpDrawer v-model="isCalculatorVisible">
        <Calculator />
      </SlidingUpDrawer>
      <SlidingUpDrawer v-model="isBreakoutVisible">
        <Breakout />
      </SlidingUpDrawer>
      <SlidingUpDrawer v-model="isSnakeVisible">
        <Snake />
      </SlidingUpDrawer>
      <SlidingUpDrawer v-model="isSudokuVisible">
        <Sudoku />
      </SlidingUpDrawer>
    </Teleport>


  </div>
</template>

<style scoped>
.wrapper {
  --bg: #111;
  --card: #1a1a1a;
  --text: #888;
  --dim: #555;
  --accent: #ccc;
  /* min-height: 100vh; */
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
}

.wrapper.light {
  --bg: #f5f5f5;
  --card: #fff;
  --text: #555;
  --dim: #999;
  --accent: #333;
}

/* Sticky header container */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--card);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .75rem 1rem;
  background: var(--card);
  border-bottom: 1px solid var(--dim);
}

.logo {
  font-weight: 600;
  color: var(--accent);
}

.toggle {
  background: none;
  border: 1px solid var(--dim);
  color: var(--accent);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: border-color .15s;
}

.toggle:hover {
  border-color: var(--accent);
}

.terminal {
  max-height: 0;
  overflow: hidden;
  background: var(--card);
  border-bottom: 1px solid transparent;
  transition: max-height .25s ease, border-color .25s ease;
  font: 13px/1.5 'SF Mono', Consolas, monospace;
}

.terminal.open {
  max-height: 50vh;
  border-bottom-color: var(--dim);
}

.output {
  height: 50vh;
  padding: 1rem;
  padding-bottom: .5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.line {
  white-space: pre-wrap;
  word-break: break-word;
  flex-shrink: 0;
}

.prompt {
  color: var(--dim);
  margin-right: .5rem;
  user-select: none;
  font-size: 1.5rem;
}

.input {
  display: flex;
  margin-top: auto;
}

input {
  flex: 1;
  background: none;
  border: none;
  color: var(--accent);
  font: inherit;
  outline: none;
}

input::placeholder {
  color: var(--dim);
}

.cmd {
  color: var(--accent);
}

.err {
  color: #a55;
}

.output::-webkit-scrollbar {
  width: 3px;
}

.output::-webkit-scrollbar-thumb {
  background: var(--dim);
  border-radius: 2px;
}

button {
  background: none;
}
</style>
