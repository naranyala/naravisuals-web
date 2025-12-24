---
id: "sysprog-system-calls-002"
slug: "understanding-system-calls-and-kernel-interaction"
title: "Understanding System Calls and Kernel Interaction"
date: "December 23, 2025"
references:
  - authors: "Andrew S. Tanenbaum"
    title: "Modern Operating Systems"
    journal: "Prentice Hall"
    year: "2007"
  - authors: "Michael Kerrisk"
    title: "The Linux Programming Interface"
    journal: "No Starch Press"
    year: "2010"
---

# Understanding System Calls and Kernel Interaction

## What Are System Calls?
System calls are the interface between user-space programs and the operating system kernel. They allow programs to request services like:
- **File operations**
- **Process management**
- **Network communication**

---

## How System Calls Work
1. **User Program**: Makes a system call (e.g., `open()`).
2. **Kernel**: Executes the requested operation.
3. **Return**: The kernel returns control to the user program.

---

## Example: Reading a File
Here’s how to read a file using system calls in C:

```c
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("example.txt", O_RDONLY);
    char buffer[256];
    read(fd, buffer, sizeof(buffer));
    close(fd);
    return 0;
}
```

