<script setup>
import { ref } from 'vue'

const libcPosixHeaders = [
  // Standard C Library (libc)
  { name: "stdio.h",       description: "Standard input/output functions (printf, scanf, fopen, etc.)" },
  { name: "stdlib.h",      description: "General utilities: memory allocation, random numbers, string conversion" },
  { name: "string.h",      description: "String manipulation functions (strcpy, strlen, memcmp, etc.)" },
  { name: "stddef.h",      description: "Common macros and types (NULL, size_t, offsetof)" },
  { name: "stdint.h",      description: "Fixed-width integer types (int32_t, uint64_t, etc.)" },
  { name: "stdbool.h",     description: "Boolean type and values (bool, true, false)" },
  { name: "ctype.h",       description: "Character classification and conversion (isalpha, tolower, etc.)" },
  { name: "errno.h",       description: "Error number reporting (errno, perror)" },
  { name: "assert.h",      description: "Program assertion macros (assert)" },
  { name: "time.h",        description: "Time and date functions (time, clock, strftime)" },
  { name: "locale.h",      description: "Localization utilities (setlocale, localeconv)" },
  { name: "math.h",        description: "Mathematical functions (sin, sqrt, pow, etc.)" },
  { name: "float.h",       description: "Floating-point limits and characteristics" },
  { name: "limits.h",      description: "Integer type limits (INT_MAX, CHAR_BIT, etc.)" },
  { name: "signal.h",      description: "Signal handling (signal, raise, sig_atomic_t)" },
  { name: "setjmp.h",      description: "Non-local jumps (setjmp, longjmp)" },
  { name: "stdarg.h",      description: "Variable arguments handling (va_list, va_start, etc.)" },

  // POSIX / Unix-specific headers
  { name: "unistd.h",      description: "POSIX API: read, write, fork, exec, sleep, and system calls" },
  { name: "fcntl.h",       description: "File control operations (open, fcntl)" },
  { name: "sys/types.h",   description: "Data types used in system calls (pid_t, ssize_t, etc.)" },
  { name: "sys/stat.h",    description: "File status and permissions (stat, chmod, mkdir)" },
  { name: "sys/wait.h",    description: "Wait for process termination (wait, waitpid)" },
  { name: "sys/mman.h",    description: "Memory management (mmap, munmap, mprotect)" },
  { name: "sys/socket.h",  description: "Socket interface for network communication" },
  { name: "sys/select.h",  description: "Synchronous I/O multiplexing (select)" },
  { name: "sys/time.h",    description: "High-resolution time functions (gettimeofday)" },
  { name: "sys/resource.h", description: "Resource usage (getrusage, setrlimit)" },
  { name: "sys/ioctl.h",   description: "Device-specific input/output operations" },
  { name: "sys/utsname.h", description: "System identification (uname)" },
  { name: "sys/epoll.h",   description: "Linux I/O event notification (epoll)" },
  { name: "pthread.h",     description: "POSIX threads (thread creation and synchronization)" },
  { name: "semaphore.h",   description: "POSIX named and unnamed semaphores" },
  { name: "mqueue.h",      description: "POSIX message queues" },
  { name: "dirent.h",      description: "Directory entry access (opendir, readdir)" },
  { name: "grp.h",         description: "Group database access (getgrnam)" },
  { name: "pwd.h",         description: "Password database access (getpwuid)" },
  { name: "termios.h",     description: "Terminal I/O control" },
  { name: "arpa/inet.h",   description: "Internet address manipulation (inet_addr, htons)" },
  { name: "netdb.h",       description: "Network database operations (gethostbyname)" },
  { name: "netinet/in.h",  description: "Internet protocol family definitions" },
  { name: "poll.h",        description: "I/O multiplexing (poll)" },
  { name: "sched.h",       description: "Process scheduling (sched_yield, CPU affinity)" },
  { name: "spawn.h",       description: "POSIX spawn functions (posix_spawn)" },
  { name: "aio.h",         description: "Asynchronous I/O operations" },
  { name: "dlfcn.h",       description: "Dynamic linking (dlopen, dlsym)" },
  { name: "ftw.h",         description: "File tree traversal (nftw)" },
  { name: "glob.h",        description: "Filename pattern matching (glob)" },
  { name: "langinfo.h",    description: "Language and cultural conventions" },
  { name: "monetary.h",    description: "Monetary formatting" },
  { name: "nl_types.h",    description: "Message catalogs" },
  { name: "regex.h",       description: "Regular expression matching" },
  { name: "search.h",      description: "Search tables (hsearch, tsearch)" },
  { name: "strings.h",     description: "Case-insensitive string operations (strcasecmp)" },
  { name: "syslog.h",      description: "System logging (openlog, syslog)" },
  { name: "wordexp.h",     description: "Shell-like word expansion" },
  { name: "iconv.h",       description: "Character set conversion" }
]

const currentHeader = ref({
  name: "Click to randomize",
  description: "Pick a C or POSIX header to learn more!"
})

const randomize = () => {
  const randomIndex = Math.floor(Math.random() * libcPosixHeaders.length)
  const newHeader = libcPosixHeaders[randomIndex]

  // Avoid immediate repeat
  if (newHeader.name !== currentHeader.value.name) {
    currentHeader.value = {
      name: `<${newHeader.name}>`,
      description: newHeader.description
    }
  } else {
    randomize()
  }
}
</script>

<template>
  <div class="container">
    <div class="card">
      <button @click="randomize" class="btn" style="margin-bottom: 20px;">
        Random libc/POSIX Header
      </button>

      <div class="display">
        <div class="header-name">{{ currentHeader.name }}</div>
        <div class="header-desc">{{ currentHeader.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
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
  padding: 24px 20px;
  text-align: center;
  min-height: 180px;
  font-size: 1.1rem;
  color: #e0e0e0;
  background: #0f0f0f;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  font-family: 'Courier New', monospace;
}

.header-name {
  font-weight: 700;
  font-size: 1.4rem;
  color: #4ade80; /* green accent for header names */
}

.header-desc {
  font-weight: 400;
  font-size: 1rem;
  color: #cccccc;
  line-height: 1.5;
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
