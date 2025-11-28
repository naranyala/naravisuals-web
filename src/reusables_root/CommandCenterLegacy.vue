<template>
  <div class="terminal" :class="{ expanded }" @click="focusInput">
    <div class="output" ref="outputRef">
      <div v-for="(e, i) in history" :key="i" :class="['line', e.type]">
        <span v-if="e.showPrompt" class="prompt">$</span>
        <span v-html="e.content"></span>
      </div>
      <div class="line input">
        <span class="prompt">$</span>
        <input
          ref="inputRef"
          v-model="cmd"
          @keydown.enter.prevent="exec"
          autocomplete="off"
          spellcheck="false"
          placeholder="type help"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const history = ref([])
const cmd = ref('')
const expanded = ref(false)
const inputRef = ref(null)
const outputRef = ref(null)

const commands = {
  help: () => out('commands: help, show, active, minimize'),
  show: () => out('help — list commands\nshow — display info\nactive — expand terminal\nminimize — shrink terminal'),
  active: () => expanded.value = true,
  minimize: () => expanded.value = false
}

function out(content, type = '') {
  history.value.push({ content, type, showPrompt: false })
  nextTick(() => outputRef.value.scrollTop = outputRef.value.scrollHeight)
}

function exec() {
  const input = cmd.value.trim()
  if (!input) return

  history.value.push({ content: input, type: 'cmd', showPrompt: true })

  const c = commands[input]
  if (c) c()
  else out(`unknown: ${input}`, 'err')

  cmd.value = ''
}

function focusInput() { inputRef.value?.focus() }

defineExpose({ out, register: (n, fn) => commands[n] = fn })
</script>

<style scoped>
.terminal {
  background: #111;
  color: #888;
  font: 13px/1.5 'SF Mono', Consolas, monospace;
  padding: .75rem 1rem;
  width: 100%;
  transition: height .25s ease;
  height: 80px;
  overflow: hidden;
}

.terminal.expanded {
  height: 50vh;
}

.output {
  height: 100%;
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
  color: #555;
  margin-right: .5rem;
  user-select: none;
}

.input { display: flex; margin-top: auto; }

input {
  flex: 1;
  background: none;
  border: none;
  color: #ccc;
  font: inherit;
  outline: none;
}

input::placeholder { color: #444; }

.cmd { color: #ccc; }
.err { color: #a55; }

.output::-webkit-scrollbar { width: 3px; }
.output::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
</style>
