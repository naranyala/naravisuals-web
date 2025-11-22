
<script setup>
import { ref } from 'vue'



const systemProgrammingTerms = [
  // Operating System
  "Process", "Thread", "Mutex", "Semaphore", "Deadlock",
  "Context Switch", "Kernel", "System Call", "Interrupt",
  "Scheduler", "Virtual Memory", "Page Table", "TLB",
  
  // Memory
  "Heap", "Stack", "Malloc", "Free", "Memory Leak",
  "Segmentation Fault", "Buffer Overflow", "MMU",
  "Paging", "Swapping", "Garbage Collection",
  
  // File Systems
  "Inode", "File Descriptor", "Pipe", "Socket",
  "Block Device", "Character Device", "Mount Point",
  "Superblock", "Hard Link", "Symbolic Link",
  
  // Concurrency
  "Race Condition", "Critical Section", "Spinlock",
  "Atomic Operation", "Barrier", "Condition Variable",
  "Reader-Writer Lock", "Thread Pool", "Coroutine",
  
  // IPC
  "Shared Memory", "Message Queue", "Signal",
  "Named Pipe", "Unix Domain Socket", "RPC",
  
  // Low-Level
  "Assembly", "Register", "Pointer", "Device Driver",
  "DMA", "Cache Coherence", "Endianness", "Word Alignment",
  
  // Tools
  "Fork", "Exec", "Clone", "Wait", "Kill",
  "Ptrace", "Strace", "Valgrind", "GDB",
  
  // Performance
  "CPU Cache", "Branch Prediction", "Prefetching",
  "Vectorization", "Pipeline Stall",
  
  // Security
  "Privilege Escalation", "ASLR", "Stack Canary", "Sandbox"
]


const currentTerm = ref("Click to randomize")

const randomize = () => {

  const combinedTerms = [
    ...systemProgrammingTerms,
  ]

  // console.log(combinedTerms)

  const randomIndex = Math.floor(Math.random() * combinedTerms.length)
  const newTerm = combinedTerms[randomIndex]
  
  if (newTerm !== currentTerm.value) {
    currentTerm.value = newTerm
  } else {
    randomize()
  }
}
</script>

<template>
  <div class="container">
    <div class="card">
      <button @click="randomize" class="btn" style="margin-bottom: 20px;">
        Random Terms
      </button>

      <div class="display">
        {{ currentTerm }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  /* min-height: 100vh; */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  padding: 0px;
  margin: 20px auto;
  text-align: center;
}

.card {
  max-width: 500px;
  width: 100%;
  padding: 20px;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  margin: 0 auto;
}

.display {
  padding: 60px 20px;
  text-align: center;
  height: 200px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  background: #0f0f0f;
  border-radius: 8px;
  margin-bottom: 24px;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn {
  width: 100%;
  padding: 16px;
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}
</style>
