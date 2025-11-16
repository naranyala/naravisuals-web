<script setup>
import { ref } from 'vue'

import FullScreenModal from "./reusables/FullScreenModal.vue"
import CodeBlock from "./reusables/CodeBlock.vue"

import strReactiveH from "./raw-files/reactive.h?raw"

const myLibraries = ref([
  { libName: "reactive.h", isOpen: false, code: strReactiveH },
  { libName: "str_builder.h", isOpen: false, code: ""},
  { libName: "dynamic_arr.h", isOpen: false, code: ""},
  { libName: "kv_store.h", isOpen: false, code: ""}
])



const cLibraryHeaders = ref([
  // Standard C Headers (C11/C17/C23)
  { isOpen: false, header: "stdio.h",      example: "", desc: "Standard Input/Output (e.g., printf, scanf)" },
  { isOpen: false, header: "stdlib.h",     example: "", desc: "Standard Library (e.g., malloc, free, exit)" },
  { isOpen: false, header: "string.h",     example: "", desc: "String manipulation (e.g., strcpy, strlen)" },
  { isOpen: false, header: "math.h",       example: "", desc: "Mathematical functions (e.g., sin, sqrt)" },
  { isOpen: false, header: "time.h",       example: "", desc: "Time and date functions (e.g., time, clock)" },
  { isOpen: false, header: "ctype.h",      example: "", desc: "Character handling (e.g., isalpha, tolower)" },
  { isOpen: false, header: "stdint.h",     example: "", desc: "Fixed-width integer types (e.g., int32_t, uint64_t)" },
  { isOpen: false, header: "stddef.h",     example: "", desc: "Standard definitions (e.g., NULL, size_t)" },
  { isOpen: false, header: "stdbool.h",    example: "", desc: "Boolean type and values (e.g., bool, true, false)" },
  { isOpen: false, header: "assert.h",     example: "", desc: "Assertions (e.g., assert macro)" },
  { isOpen: false, header: "signal.h",     example: "", desc: "Signal handling (e.g., signal, raise)" },
  { isOpen: false, header: "errno.h",      example: "", desc: "Error codes (e.g., errno, perror)" },
  { isOpen: false, header: "float.h",      example: "", desc: "Floating-point limits (e.g., FLT_MAX, DBL_MIN)" },
  { isOpen: false, header: "limits.h",     example: "", desc: "Implementation-defined limits (e.g., INT_MAX, CHAR_BIT)" },
  { isOpen: false, header: "stdarg.h",     example: "", desc: "Variable arguments (e.g., va_list, va_start)" },
  { isOpen: false, header: "setjmp.h",     example: "", desc: "Non-local jumps (e.g., setjmp, longjmp)" },
  { isOpen: false, header: "locale.h",     example: "", desc: "Localization (e.g., setlocale, localeconv)" },
  { isOpen: false, header: "wchar.h",      example: "", desc: "Wide character functions (e.g., wprintf, wcslen)" },
  { isOpen: false, header: "wctype.h",     example: "", desc: "Wide character classification (e.g., iswalpha)" },
  { isOpen: false, header: "uchar.h",      example: "", desc: "Unicode utilities (C11, e.g., char16_t, char32_t)" },
  { isOpen: false, header: "inttypes.h",   example: "", desc: "Format conversion for inttypes (e.g., PRIu64)" },
  { isOpen: false, header: "stdalign.h",   example: "", desc: "Alignment utilities (C11, e.g., alignas, alignof)" },
  { isOpen: false, header: "stdnoreturn.h",example: "", desc: "noreturn macro (C11, e.g., _Noreturn)" },
  { isOpen: false, header: "tgmath.h",     example: "", desc: "Type-generic math macros (e.g., sin, cos)" },
  { isOpen: false, header: "complex.h",    example: "", desc: "Complex number arithmetic (e.g., complex, I)" },

  // POSIX/Linux/Unix Headers
  { isOpen: false, header: "unistd.h",     example: "", desc: "POSIX API (file operations, process control, e.g., read, fork)" },
  { isOpen: false, header: "sys/types.h",  example: "", desc: "Data types (e.g., pid_t, size_t, off_t)" },
  { isOpen: false, header: "sys/stat.h",   example: "", desc: "File status (e.g., stat, mkdir, chmod)" },
  { isOpen: false, header: "sys/wait.h",   example: "", desc: "Process control (e.g., waitpid, WIFEXITED)" },
  { isOpen: false, header: "sys/socket.h", example: "", desc: "Socket programming (e.g., socket, bind, connect)" },
  { isOpen: false, header: "sys/mman.h",   example: "", desc: "Memory management (e.g., mmap, munmap)" },
  { isOpen: false, header: "sys/ioctl.h",  example: "", desc: "I/O control (e.g., ioctl)" },
  { isOpen: false, header: "sys/time.h",   example: "", desc: "Time types and functions (e.g., gettimeofday)" },
  { isOpen: false, header: "sys/resource.h", example: "", desc: "Resource usage (e.g., getrusage, setrlimit)" },
  { isOpen: false, header: "sys/select.h", example: "", desc: "I/O multiplexing (e.g., select)" },
  { isOpen: false, header: "sys/utsname.h",example: "", desc: "System information (e.g., uname)" },
  { isOpen: false, header: "fcntl.h",      example: "", desc: "File control (e.g., open, fcntl)" },
  { isOpen: false, header: "dirent.h",     example: "", desc: "Directory operations (e.g., opendir, readdir)" },
  { isOpen: false, header: "pthread.h",    example: "", desc: "POSIX threads (e.g., pthread_create, pthread_mutex_t)" },
  { isOpen: false, header: "semaphore.h",  example: "", desc: "Semaphores (e.g., sem_init, sem_wait)" },
  { isOpen: false, header: "mqueue.h",     example: "", desc: "POSIX message queues (e.g., mq_open, mq_send)" },
  { isOpen: false, header: "sched.h",      example: "", desc: "Scheduling (e.g., sched_yield, sched_get_priority_max)" },
  { isOpen: false, header: "netinet/in.h", example: "", desc: "Internet domain addresses (e.g., struct sockaddr_in)" },
  { isOpen: false, header: "arpa/inet.h",  example: "", desc: "Internet operations (e.g., inet_addr, inet_ntoa)" },
  { isOpen: false, header: "netdb.h",      example: "", desc: "Network database operations (e.g., gethostbyname)" },
  { isOpen: false, header: "termios.h",    example: "", desc: "Terminal I/O (e.g., tcgetattr, tcsetattr)" },
  { isOpen: false, header: "poll.h",       example: "", desc: "I/O multiplexing (e.g., poll)" },
  { isOpen: false, header: "aio.h",        example: "", desc: "Asynchronous I/O (e.g., aio_read, aio_write)" },
  { isOpen: false, header: "dlfcn.h",      example: "", desc: "Dynamic linking (e.g., dlopen, dlsym)" },
  { isOpen: false, header: "grp.h",        example: "", desc: "Group file operations (e.g., getgrnam, getgrgid)" },
  { isOpen: false, header: "pwd.h",        example: "", desc: "Password file operations (e.g., getpwnam, getpwuid)" },
  { isOpen: false, header: "shadow.h",     example: "", desc: "Shadow password file operations (e.g., getspnam)" },
  { isOpen: false, header: "crypt.h",      example: "", desc: "Password hashing (e.g., crypt)" },
  { isOpen: false, header: "libgen.h",     example: "", desc: "Pathname manipulation (e.g., basename, dirname)" },
  { isOpen: false, header: "glob.h",       example: "", desc: "Pathname pattern matching (e.g., glob)" },
  { isOpen: false, header: "fnmatch.h",    example: "", desc: "Filename matching (e.g., fnmatch)" },
  { isOpen: false, header: "regex.h",      example: "", desc: "Regular expressions (e.g., regcomp, regexec)" },
  { isOpen: false, header: "wordexp.h",    example: "", desc: "Word expansion (e.g., wordexp)" },
  { isOpen: false, header: "ftw.h",        example: "", desc: "File tree walking (e.g., ftw, nftw)" },
  { isOpen: false, header: "syslog.h",     example: "", desc: "System logging (e.g., syslog, openlog)" },
  { isOpen: false, header: "utime.h",      example: "", desc: "File access/modification times (e.g., utime)" },
  { isOpen: false, header: "utmpx.h",      example: "", desc: "User accounting (e.g., getutxent)" },
  { isOpen: false, header: "lastlog.h",    example: "", desc: "Last login logging (e.g., struct lastlog)" },
  { isOpen: false, header: "sys/ipc.h",    example: "", desc: "IPC (Inter-Process Communication, e.g., ftok)" },
  { isOpen: false, header: "sys/msg.h",    example: "", desc: "Message queues (e.g., msgget, msgsnd)" },
  { isOpen: false, header: "sys/shm.h",    example: "", desc: "Shared memory (e.g., shmget, shmat)" },
  { isOpen: false, header: "sys/sem.h",    example: "", desc: "Semaphores (e.g., semget, semop)" },
]);

</script>

<template>
  <div class="projects-container" @keydown="handleKeydown">
    <h1 class="section-title">SEGFAULT</h1>

    <hr/>

    <h2>UTILITY FUNCTION USAGE</h2>

    <div class="group-container">
    <div v-for="item in myLibraries" :key="item.libName">
      <button @click="item.isOpen = true" style="margin: 10px;">{{item.libName}}</button>

  <FullScreenModal v-model="item.isOpen">
        <div style="margin-top: 60px;">
        <h2>{{item.libName}}</h2>

        <p style="margin: 20px 0; border: 1px solid gray; border-radius: 10px; padding: 10px;">lorem ipsum dolor</p>


            <CodeBlock language="c" :label="item.libName" :code="item.code"/>

        </div>
  </FullScreenModal>
    </div>
    </div>

    <hr/>

    <h2 style="margin-top: 20px;">LIBC/POSIX EXAMPLES</h2>

    <div class="group-container">
    <div v-for="item in cLibraryHeaders" :key="item.header">
      <button @click="item.isOpen = true" style="margin: 10px;">{{item.header}}</button>

  <FullScreenModal v-model="item.isOpen">
        <div style="margin-top: 60px;">
        <h2>{{item.libName}}</h2>

        <p style="margin: 20px 0; border: 1px solid gray; border-radius: 10px; padding: 10px;">lorem ipsum dolor</p>


            <CodeBlock language="c" :label="item.header" :code="item.example"/>

        </div>
  </FullScreenModal>
    </div>
    </div>

  </div>
</template>

<style scoped>
.projects-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background-color: #121212;
  color: #fff;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}

.group-container {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 20px 0;
}

</style>
