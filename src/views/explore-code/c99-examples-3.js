// topics.c.complete.js
// The missing pieces – now your C explorer is truly comprehensive!

function dedent(str) {
    const lines = str.split('\n')
    const nonEmpty = lines.filter(l => l.trim())
    if (!nonEmpty.length) return ''
    const indent = Math.min(...nonEmpty.map(l => l.match(/^ */)[0].length))
    return lines.map(l => l.slice(indent)).join('\n').trim()
}

export const topics = [
    {
        id: 'enum',
        title: 'Enumerations (enum)',
        description: 'Named integer constants — great for states and options.',
        example: dedent(`
      #include <stdio.h>

      enum Day {
          MON = 1,
          TUE, WED, THU, FRI,
          SAT = 10,
          SUN
      };

      int main() {
          enum Day today = WED;

          printf("Today is day %d\\n", today);  // 3

          if (today == SAT || today == SUN) {
              printf("Weekend! 😴\\n");
          } else {
              printf("Back to work! 💻\\n");
          }

          return 0;
      }
    `)
    },
    {
        id: 'typedef',
        title: 'Type Aliases with typedef',
        description: 'Create meaningful names for complex types.',
        example: dedent(`
      #include <stdio.h>

      typedef unsigned long long u64;
      typedef struct {
          char name[32];
          int age;
      } Person;

      typedef void (*Callback)(int);

      void on_event(Callback cb, int value) {
          cb(value);
      }

      void handler(int x) {
          printf("Handled event: %d\\n", x);
      }

      int main() {
          u64 big = 18446744073709551615ULL;
          printf("Max u64: %llu\\n", big);

          Person p = {"Eve", 27};
          printf("%s is %d\\n", p.name, p.age);

          on_event(handler, 42);
          return 0;
      }
    `)
    },
    {
        id: 'preprocessor',
        title: 'Advanced Preprocessor',
        description: '#ifdef, #ifndef, guards, and stringification.',
        example: dedent(`
      #include <stdio.h>

      #define DEBUG
      #define VERSION "2.1"
      #define STRINGIFY(x) #x
      #define CONCAT(a, b) a ## b

      #ifndef PI
          #define PI 3.14159265359
      #endif

      int main() {
          #ifdef DEBUG
              printf("Debug mode ON\\n");
          #endif

          printf("App version: %s\\n", VERSION);
          printf("PI ≈ %.5f\\n", PI);

          printf("Stringified: %s\\n", STRINGIFY(Hello World!));

          int xy = 100;
          int CONCAT(x, y) = 42;
          printf("xy = %d\\n", xy);  // 42

          return 0;
      }
    `)
    },
    {
        id: 'inline-functions',
        title: 'Inline Functions & restrict',
        description: 'Performance hints and pointer aliasing control.',
        example: dedent(`
      #include <stdio.h>

      static inline int square(int x) {
          return x * x;
      }

      // Fast memory copy with restrict (no aliasing)
      void fast_copy(int* restrict dest, const int* restrict src, size_t n) {
          for (size_t i = 0; i < n; i++) {
              dest[i] = src[i];
          }
      }

      int main() {
          printf("Square of 9: %d\\n", square(9));

          int src[] = {1, 2, 3, 4, 5};
          int dest[5];
          fast_copy(dest, src, 5);

          for (int i = 0; i < 5; i++) {
              printf("%d ", dest[i]);
          }
          printf("\\n");

          return 0;
      }
    `)
    },
    {
        id: 'volatile-const',
        title: 'volatile and const Qualifiers',
        description: 'When the compiler must not optimize.',
        example: dedent(`
      #include <stdio.h>

      volatile int timer_ticks = 0;  // Modified by hardware/interrupt
      const char* greeting = "Hello";

      int main() {
          printf("Greeting: %s\\n", greeting);

          // Simulate hardware register
          volatile int* status_reg = (volatile int*)0x1000;

          printf("Waiting for device...\\n");
          while (*status_reg == 0) {
              // Busy wait — volatile prevents optimization!
          }
          printf("Device ready!\\n");

          return 0;
      }
    `)
    },
    {
        id: 'flexible-array',
        title: 'Flexible Array Member',
        description: 'C99 feature for dynamic-size structs.',
        example: dedent(`
      #include <stdio.h>
      #include <stdlib.h>
      #include <string.h>

      typedef struct {
          int count;
          char data[];  // Flexible array member (C99+)
      } Packet;

      int main() {
          size_t size = sizeof(Packet) + 10 * sizeof(char);
          Packet* p = malloc(size);

          p->count = 10;
          strcpy(p->data, "V is cool!");

          printf("Count: %d\\n", p->count);
          printf("Data: %s\\n", p->data);

          free(p);
          return 0;
      }
    `)
    },
    {
        id: 'setjmp-longjmp',
        title: 'setjmp / longjmp (Non-local jumps)',
        description: 'Exception-like control flow in pure C.',
        example: dedent(`
      #include <stdio.h>
      #include <setjmp.h>

      jmp_buf env;

      void deep_function() {
          printf("About to jump back...\\n");
          longjmp(env, 42);  // Jump back with value 42
      }

      int main() {
          int val = setjmp(env);
          if (val == 0) {
              printf("Normal flow – calling deep_function()\\n");
              deep_function();
          } else {
              printf("Returned from longjmp with value: %d\\n", val);
          }
          return 0;
      }
    `)
    }
]

