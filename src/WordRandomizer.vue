<script setup>
import { ref } from 'vue'


const cProgrammingEcosystem = [
  // Compilers
  { name: "gcc",          description: "GNU Compiler Collection, the most widely used C compiler" },
  { name: "clang",        description: "LLVM-based C compiler, known for fast compilation and diagnostics" },
  { name: "tcc",          description: "Tiny C Compiler, a small and fast compiler" },
  { name: "msvc",         description: "Microsoft Visual C++, the C compiler for Windows" },
  { name: "icc",          description: "Intel C Compiler, optimized for Intel processors" },
  { name: "armcc",        description: "ARM Compiler, for ARM-based microcontrollers" },

  // Build Systems
  { name: "make",         description: "GNU Make, a build automation tool" },
  { name: "cmake",        description: "Cross-platform build system generator" },
  { name: "ninja",        description: "Fast, low-level build system" },
  { name: "meson",        description: "Open-source build system designed for speed" },
  { name: "autotools",    description: "GNU Autotools (autoconf, automake, libtool) for portable builds" },

  // Debugging and Profiling
  { name: "gdb",          description: "GNU Debugger, the standard debugger for C programs" },
  { name: "lldb",         description: "LLVM Debugger, an alternative to GDB" },
  { name: "valgrind",     description: "Memory leak and profiling tool for Linux" },
  { name: "strace",       description: "System call tracer for Linux" },
  { name: "ltrace",       description: "Library call tracer for Linux" },
  { name: "perf",         description: "Linux performance analysis tool" },
  { name: "addr2line",    description: "Converts program addresses to file and line numbers" },

  // Static Analysis
  { name: "clang-tidy",   description: "Clang-based linter for C and C++ code" },
  { name: "cppcheck",     description: "Static analysis tool for C/C++ code" },
  { name: "splint",       description: "Static checker for C programs" },
  { name: "coverity",     description: "Commercial static analysis tool for finding defects" },

  // Libraries
  { name: "glib",         description: "General-purpose utility library for C" },
  { name: "glibc",        description: "GNU C Library, the standard C library for Linux" },
  { name: "libc",         description: "Standard C Library, implementation of the C standard library" },
  { name: "libcurl",      description: "Client-side URL transfer library" },
  { name: "libxml2",      description: "XML parsing library" },
  { name: "libsqlite3",   description: "Embedded SQLite database library" },
  { name: "openssl",      description: "Cryptography and SSL/TLS library" },
  { name: "zlib",         description: "Compression library" },
  { name: "libpng",       description: "PNG image handling library" },
  { name: "libjpeg",      description: "JPEG image handling library" },
  { name: "libffi",       description: "Foreign Function Interface library" },
  { name: "ncurses",      description: "Terminal UI library" },
  { name: "readline",     description: "Command-line input editing library" },
  { name: "boost",        description: "C++ libraries, often used with C" },
  { name: "libevent",     description: "Event notification library" },
  { name: "libuv",        description: "Asynchronous I/O library, used in Node.js" },
  { name: "protobuf-c",   description: "Protocol Buffers implementation for C" },
  { name: "json-c",       description: "JSON parsing library for C" },
  { name: "libyaml",      description: "YAML parsing library" },
  { name: "libwebsockets", description: "WebSocket library for C" },
  { name: "libmicrohttpd", description: "Embedded HTTP server library" },
  { name: "libpcap",      description: "Packet capture library" },
  { name: "libusb",       description: "USB device access library" },
  { name: "libssh",       description: "SSH protocol library" },
  { name: "libgit2",      description: "Git library for C" },
  { name: "libarchive",   description: "Archive handling library" },
  { name: "libsndfile",   description: "Audio file handling library" },
  { name: "libao",        description: "Audio output library" },
  { name: "libpulse",     description: "PulseAudio interface library" },
  { name: "libvlc",       description: "VLC media player library" },
  { name: "libavcodec",   description: "FFmpeg audio/video codec library" },
  { name: "libavformat",  description: "FFmpeg container format library" },
  { name: "libswscale",   description: "FFmpeg image scaling library" },
  { name: "libsdl",       description: "Simple DirectMedia Layer, graphics/audio library" },
  { name: "libsdl2",      description: "SDL2, modern version of SDL" },
  { name: "raylib",       description: "Simple and easy-to-use game library" },
  { name: "allegro",      description: "Game programming library" },
  { name: "sfml",         description: "Simple and Fast Multimedia Library" },
  { name: "gtk",          description: "GIMP Toolkit, GUI library for C" },
  { name: "qt",           description: "Cross-platform GUI framework" },
  { name: "wxwidgets",    description: "Cross-platform GUI library" },
  { name: "fltk",         description: "Fast Light Toolkit, GUI library" },
  { name: "nanovg",       description: "Anti-aliased 2D vector drawing library" },
  { name: "cairo",        description: "2D graphics library" },
  { name: "pango",        description: "Text layout and rendering library" },
  { name: "freetype",     description: "Font rendering library" },
  { name: "harfbuzz",     description: "Text shaping engine" },
  { name: "librsvg",      description: "SVG rendering library" },
  { name: "poppler",      description: "PDF rendering library" },
  { name: "mupdf",        description: "Lightweight PDF/XPS viewer library" },
  { name: "libtiff",      description: "TIFF image support library" },
  { name: "libwebp",      description: "WebP image support library" },
  { name: "libexif",      description: "EXIF metadata support library" },
  { name: "libraw",       description: "RAW image support library" },
  { name: "leptonica",    description: "Image processing and analysis library" },
  { name: "tesseract",    description: "OCR (Optical Character Recognition) engine" },
  { name: "opencv",       description: "OpenCV, computer vision library" },
  { name: "dlib",         description: "Machine learning and computer vision library" },
  { name: "onnxruntime",  description: "ONNX model inference library" },

  // Embedded/RTOS
  { name: "freertos",     description: "Real-time OS for embedded systems" },
  { name: "zephyr",       description: "Scalable RTOS for embedded devices" },
  { name: "chibios",      description: "RTOS for embedded systems" },
  { name: "mbed-os",      description: "ARM's OS for IoT devices" },
  { name: "arduino",      description: "Arduino framework for microcontrollers" },
  { name: "esp-idf",      description: "Espressif IoT Development Framework for ESP32" },
  { name: "platformio",   description: "Cross-platform embedded development ecosystem" },

  // Networking
  { name: "libpcap",      description: "Packet capture library" },
  { name: "libnet",       description: "Packet construction and injection library" },
  { name: "zeromq",       description: "Lightweight messaging library" },
  { name: "nanomsg",      description: "Scalable protocols library" },
  { name: "mqtt",         description: "MQTT protocol library for IoT" },
  { name: "librdkafka",   description: "Apache Kafka client library" },
  { name: "libcoap",      description: "CoAP protocol library" },

  // Databases
  { name: "sqlite",       description: "Embedded SQL database engine" },
  { name: "leveldb",      description: "Fast key-value storage library" },
  { name: "rocksdb",      description: "Embedded key-value store by Facebook" },
  { name: "lmdb",         description: "Lightning Memory-Mapped Database" },
  { name: "berkeley-db",  description: "Embedded database library" },
  { name: "redis",        description: "In-memory data store (C client: hiredis)" },
  { name: "postgresql",   description: "PostgreSQL database (C client: libpq)" },
  { name: "mysql",        description: "MySQL database (C client: libmysqlclient)" },

  // Concurrency
  { name: "pthreads",     description: "POSIX threads library for multi-threading" },
  { name: "openmp",       description: "Multi-platform shared-memory parallelism" },
  { name: "libdispatch",  description: "Grand Central Dispatch (GCD) for concurrent code" },
  { name: "libuv",        description: "Asynchronous I/O library, used in Node.js" },

  // Testing
  { name: "check",        description: "Unit testing framework for C" },
  { name: "cmocka",       description: "Unit testing framework with mock objects" },
  { name: "unity",        description: "Simple unit testing framework for C" },
  { name: "googletest",   description: "Google Test, a C++ testing framework usable with C" },

  // Documentation
  { name: "doxygen",      description: "Documentation generator for C and other languages" },
  { name: "sphinx",       description: "Documentation generator with Breathe for C" },

  // Package Managers
  { name: "vcpkg",        description: "C/C++ package manager by Microsoft" },
  { name: "conan",        description: "C/C++ package manager" },
  { name: "apt",          description: "Debian/Ubuntu package manager" },
  { name: "yum",          description: "Red Hat package manager" },
  { name: "brew",         description: "macOS package manager" },
  { name: "pacman",       description: "Arch Linux package manager" },

  // IDEs/Editors
  { name: "vscode",       description: "Visual Studio Code, lightweight code editor" },
  { name: "clion",        description: "JetBrains CLion, C/C++ IDE" },
  { name: "eclipse",      description: "Eclipse CDT, C/C++ Development Tooling" },
  { name: "codeblocks",   description: "Code::Blocks, free C/C++ IDE" },
  { name: "sublime",      description: "Sublime Text, code editor" },
  { name: "vim",          description: "Vim/Neovim, terminal-based text editor" },
  { name: "emacs",        description: "Emacs, extensible text editor" },

  // Version Control
  { name: "git",          description: "Version control system" },
  { name: "svn",          description: "Subversion, centralized version control" },
  { name: "mercurial",    description: "Mercurial, distributed version control" },

  // Miscellaneous
  { name: "docker",       description: "Containerization platform" },
  { name: "qemu",         description: "Emulator and virtualizer" },
  { name: "wine",         description: "Windows compatibility layer for Linux" },
  { name: "wasm",         description: "WebAssembly, portable binary format" },
  { name: "emscripten",   description: "Compile C/C++ to WebAssembly" },
  { name: "llvm",         description: "Compiler infrastructure and toolchain" },
  { name: "binutils",     description: "GNU binary utilities (ld, as, objdump)" },
  { name: "gprof",        description: "Performance analysis tool" },
  { name: "ktrace",       description: "Kernel trace utility" },
  { name: "dtrace",       description: "Dynamic tracing framework" },
];

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


const cLibraryHeaders = [
  // Standard C Headers (C11/C17/C23)
  { header: "stdio.h",      description: "Standard Input/Output (e.g., printf, scanf)" },
  { header: "stdlib.h",     description: "Standard Library (e.g., malloc, free, exit)" },
  { header: "string.h",     description: "String manipulation (e.g., strcpy, strlen)" },
  { header: "math.h",       description: "Mathematical functions (e.g., sin, sqrt)" },
  { header: "time.h",       description: "Time and date functions (e.g., time, clock)" },
  { header: "ctype.h",      description: "Character handling (e.g., isalpha, tolower)" },
  { header: "stdint.h",     description: "Fixed-width integer types (e.g., int32_t, uint64_t)" },
  { header: "stddef.h",     description: "Standard definitions (e.g., NULL, size_t)" },
  { header: "stdbool.h",    description: "Boolean type and values (e.g., bool, true, false)" },
  { header: "assert.h",     description: "Assertions (e.g., assert macro)" },
  { header: "signal.h",     description: "Signal handling (e.g., signal, raise)" },
  { header: "errno.h",      description: "Error codes (e.g., errno, perror)" },
  { header: "float.h",      description: "Floating-point limits (e.g., FLT_MAX, DBL_MIN)" },
  { header: "limits.h",     description: "Implementation-defined limits (e.g., INT_MAX, CHAR_BIT)" },
  { header: "stdarg.h",     description: "Variable arguments (e.g., va_list, va_start)" },
  { header: "setjmp.h",     description: "Non-local jumps (e.g., setjmp, longjmp)" },
  { header: "locale.h",     description: "Localization (e.g., setlocale, localeconv)" },
  { header: "wchar.h",      description: "Wide character functions (e.g., wprintf, wcslen)" },
  { header: "wctype.h",     description: "Wide character classification (e.g., iswalpha)" },
  { header: "uchar.h",      description: "Unicode utilities (C11, e.g., char16_t, char32_t)" },
  { header: "inttypes.h",   description: "Format conversion for inttypes (e.g., PRIu64)" },
  { header: "stdalign.h",   description: "Alignment utilities (C11, e.g., alignas, alignof)" },
  { header: "stdnoreturn.h",description: "noreturn macro (C11, e.g., _Noreturn)" },
  { header: "tgmath.h",     description: "Type-generic math macros (e.g., sin, cos)" },
  { header: "complex.h",    description: "Complex number arithmetic (e.g., complex, I)" },

  // POSIX/Linux/Unix Headers
  { header: "unistd.h",     description: "POSIX API (file operations, process control, e.g., read, fork)" },
  { header: "sys/types.h",  description: "Data types (e.g., pid_t, size_t, off_t)" },
  { header: "sys/stat.h",   description: "File status (e.g., stat, mkdir, chmod)" },
  { header: "sys/wait.h",   description: "Process control (e.g., waitpid, WIFEXITED)" },
  { header: "sys/socket.h", description: "Socket programming (e.g., socket, bind, connect)" },
  { header: "sys/mman.h",   description: "Memory management (e.g., mmap, munmap)" },
  { header: "sys/ioctl.h",  description: "I/O control (e.g., ioctl)" },
  { header: "sys/time.h",   description: "Time types and functions (e.g., gettimeofday)" },
  { header: "sys/resource.h", description: "Resource usage (e.g., getrusage, setrlimit)" },
  { header: "sys/select.h", description: "I/O multiplexing (e.g., select)" },
  { header: "sys/utsname.h",description: "System information (e.g., uname)" },
  { header: "fcntl.h",      description: "File control (e.g., open, fcntl)" },
  { header: "dirent.h",     description: "Directory operations (e.g., opendir, readdir)" },
  { header: "pthread.h",    description: "POSIX threads (e.g., pthread_create, pthread_mutex_t)" },
  { header: "semaphore.h",  description: "Semaphores (e.g., sem_init, sem_wait)" },
  { header: "mqueue.h",     description: "POSIX message queues (e.g., mq_open, mq_send)" },
  { header: "sched.h",      description: "Scheduling (e.g., sched_yield, sched_get_priority_max)" },
  { header: "netinet/in.h", description: "Internet domain addresses (e.g., struct sockaddr_in)" },
  { header: "arpa/inet.h",  description: "Internet operations (e.g., inet_addr, inet_ntoa)" },
  { header: "netdb.h",      description: "Network database operations (e.g., gethostbyname)" },
  { header: "termios.h",    description: "Terminal I/O (e.g., tcgetattr, tcsetattr)" },
  { header: "poll.h",       description: "I/O multiplexing (e.g., poll)" },
  { header: "aio.h",        description: "Asynchronous I/O (e.g., aio_read, aio_write)" },
  { header: "dlfcn.h",      description: "Dynamic linking (e.g., dlopen, dlsym)" },
  { header: "grp.h",        description: "Group file operations (e.g., getgrnam, getgrgid)" },
  { header: "pwd.h",        description: "Password file operations (e.g., getpwnam, getpwuid)" },
  { header: "shadow.h",     description: "Shadow password file operations (e.g., getspnam)" },
  { header: "crypt.h",      description: "Password hashing (e.g., crypt)" },
  { header: "libgen.h",     description: "Pathname manipulation (e.g., basename, dirname)" },
  { header: "glob.h",       description: "Pathname pattern matching (e.g., glob)" },
  { header: "fnmatch.h",    description: "Filename matching (e.g., fnmatch)" },
  { header: "regex.h",      description: "Regular expressions (e.g., regcomp, regexec)" },
  { header: "wordexp.h",    description: "Word expansion (e.g., wordexp)" },
  { header: "ftw.h",        description: "File tree walking (e.g., ftw, nftw)" },
  { header: "syslog.h",     description: "System logging (e.g., syslog, openlog)" },
  { header: "utime.h",      description: "File access/modification times (e.g., utime)" },
  { header: "utmpx.h",      description: "User accounting (e.g., getutxent)" },
  { header: "lastlog.h",    description: "Last login logging (e.g., struct lastlog)" },
  { header: "sys/ipc.h",    description: "IPC (Inter-Process Communication, e.g., ftok)" },
  { header: "sys/msg.h",    description: "Message queues (e.g., msgget, msgsnd)" },
  { header: "sys/shm.h",    description: "Shared memory (e.g., shmget, shmat)" },
  { header: "sys/sem.h",    description: "Semaphores (e.g., semget, semop)" },
];

const currentTerm = ref("Click to randomize")

const randomize = () => {
  const strProgrammingEcosystem = cProgrammingEcosystem.map((item) => {
    return item.name + " - " + item.description;
  })

  const codingTerms = cLibraryHeaders.map((item) => {
    return item.header + " - " + item.description;
  })

  const combinedTerms = [
    ...strProgrammingEcosystem,
    ...systemProgrammingTerms,
    ...codingTerms
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
      <h4 style="text-align: center; margin-bottom: 20px;">
        Some System Programming Topic
      </h4>

      <button @click="randomize" class="btn" style="margin-bottom: 20px;">
        Randomize
      </button>

      <div class="display">
        {{ currentTerm }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  padding: 0px;
  margin: 20px;
}

.card {
  max-width: 500px;
  width: 100%;
  padding: 20px;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
}

.display {
  padding: 60px 20px;
  text-align: center;
  height: 300px;
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
