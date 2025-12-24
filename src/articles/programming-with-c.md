---
id: "random-o3"
slug: "random-03"
title: "random-03"
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

### Overview of Systems Programming
Systems programming focuses on writing software that interacts closely with the operating system and hardware, such as process control, interprocess communication, and resource management. **Key skills** include using system calls, understanding process lifecycle, and safe resource handling.

---

### Learning Path
1. **Basics**: compile, link, use `strace` and `gdb`.
2. **Processes**: `fork`, `exec`, `wait`.
3. **IPC**: pipes, FIFOs, shared memory, sockets.
4. **Signals**: handlers and safe functions.
5. **Files and mmap**: `open`, `read`, `write`, `mmap`.
6. **Networking**: BSD sockets for TCP/UDP.
7. **Concurrency**: threads and synchronization primitives.

---

### Example 1 Process creation and exec
```c
// fork_exec.c
#include <unistd.h>
#include <stdio.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    if (pid == 0) {
        execlp("ls", "ls", "-l", NULL);
        perror("execlp failed");
        return 1;
    } else if (pid > 0) {
        wait(NULL);
        printf("Child finished\n");
    } else {
        perror("fork failed");
    }
    return 0;
}
```
**Compile**: `gcc -o fork_exec fork_exec.c` and run `./fork_exec`.

---

### Example 2 Simple pipe between processes
```c
// pipe_example.c
#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main() {
    int fd[2];
    pipe(fd);
    if (fork() == 0) {
        close(fd[0]);
        write(fd[1], "hello\n", 6);
    } else {
        char buf[10];
        close(fd[1]);
        read(fd[0], buf, 6);
        printf("Parent read: %s", buf);
    }
    return 0;
}
```

---

### Example 3 Memory mapping a file
```c
// mmap_example.c
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main() {
    int fd = open("data.txt", O_RDONLY);
    struct stat st; fstat(fd, &st);
    char *p = mmap(NULL, st.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
    write(1, p, st.st_size);
    munmap(p, st.st_size);
    close(fd);
    return 0;
}
```

---

### Risks and limitations
- **Safety**: system calls can fail; always check return values and handle errors.
- **Portability**: POSIX APIs vary across systems; test on target OS.
- **Security**: avoid buffer overflows and race conditions; validate inputs and use safe APIs.

---

### Next steps and resources
- Use course notes and labs for structured exercises.
- Explore open-source course repos and examples for deeper labs.
- Start small, test with `strace` and `gdb`, and iterate.

**If you want**, I can convert this into a longer tutorial with exercises, or produce a printable Markdown lab sheet with step-by-step tasks.
