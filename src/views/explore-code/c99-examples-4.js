
function dedent(str) {
    const lines = str.split('\n')
    const nonEmpty = lines.filter(l => l.trim())
    if (!nonEmpty.length) return ''
    const indent = Math.min(...nonEmpty.map(l => l.match(/^ */)[0].length))
    return lines.map(l => l.slice(indent)).join('\n').trim()
}

export const topics = [
    {
        id: 'union',
        title: 'Unions (Memory Sharing)',
        description: 'Multiple variables sharing the same memory location.',
        example: dedent(`
      #include <stdio.h>
      #include <string.h>

      typedef union {
          float f;
          int i;
          char bytes[4];
      } Value;

      int main() {
          Value v;
          v.f = 3.14159f;

          printf("As float: %.6f\\n", v.f);
          printf("As int:   %d\\n", v.i);
          printf("As bytes: ");
          for (int i = 0; i < 4; i++) {
              printf("%02x ", (unsigned char)v.bytes[i]);
          }
          printf("\\n");

          return 0;
      }
    `)
    },
    {
        id: 'command-line-args',
        title: 'Command-Line Arguments',
        description: 'Using argc and argv to accept input from the terminal.',
        example: dedent(`
      #include <stdio.h>

      int main(int argc, char* argv[]) {
          printf("Program name: %s\\n", argv[0]);
          printf("You passed %d arguments:\\n", argc - 1);

          for (int i = 1; i < argc; i++) {
              printf("  [%d] %s\\n", i, argv[i]);
          }

          if (argc == 1) {
              printf("Tip: Try running with your name!\\n");
          }

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
