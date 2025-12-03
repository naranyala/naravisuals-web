// topics.c.fresh.js
// Brand new C programming examples – educational, real-world style

function dedent(str) {
    const lines = str.split('\n')
    const nonEmpty = lines.filter(l => l.trim())
    if (!nonEmpty.length) return ''
    const indent = Math.min(...nonEmpty.map(l => l.match(/^ */)[0].length))
    return lines.map(l => l.slice(indent)).join('\n').trim()
}

export const topics = [
    {
        id: 'bit-manipulation',
        title: 'Bit Manipulation',
        description: 'Working with bits: masks, shifts, and bitwise tricks.',
        example: dedent(`
      #include <stdio.h>

      int main() {
          unsigned int x = 0b11001010;
          printf("Original:  %08b\\n", x);

          // Set bit 3 (0-indexed)
          x |= (1 << 3);
          printf("Set bit 3: %08b\\n", x);

          // Toggle bit 7
          x ^= (1 << 7);
          printf("Toggle 7:  %08b\\n", x);

          // Check if bit 5 is set
          if (x & (1 << 5)) {
              printf("Bit 5 is set!\\n");
          }

          return 0;
      }
    `)
    },
    {
        id: 'linked-list',
        title: 'Singly Linked List',
        description: 'Manual memory management with structs and pointers.',
        example: dedent(`
      #include <stdio.h>
      #include <stdlib.h>

      typedef struct Node {
          int data;
          struct Node* next;
      } Node;

      Node* insert(Node* head, int value) {
          Node* new_node = malloc(sizeof(Node));
          new_node->data = value;
          new_node->next = head;
          return new_node;
      }

      void print_list(Node* head) {
          for (Node* p = head; p != NULL; p = p->next) {
              printf("%d -> ", p->data);
          }
          printf("NULL\\n");
      }

      void free_list(Node* head) {
          while (head) {
              Node* temp = head;
              head = head->next;
              free(temp);
          }
      }

      int main() {
          Node* head = NULL;
          head = insert(head, 10);
          head = insert(head, 20);
          head = insert(head, 30);
          print_list(head);
          free_list(head);
          return 0;
      }
    `)
    },
    {
        id: 'function-pointers',
        title: 'Function Pointers',
        description: 'Pointers to functions — enabling callbacks and flexibility.',
        example: dedent(`
      #include <stdio.h>

      int add(int a, int b) { return a + b; }
      int mul(int a, int b) { return a * b; }

      int operate(int (*op)(int, int), int x, int y) {
          return op(x, y);
      }

      int main() {
          int (*func)(int, int) = add;
          printf("Using direct pointer: %d\\n", func(5, 7));

          printf("Via wrapper (add): %d\\n", operate(add, 8, 9));
          printf("Via wrapper (mul): %d\\n", operate(mul, 8, 9));

          return 0;
      }
    `)
    },
    {
        id: 'variadic-functions',
        title: 'Variadic Functions',
        description: 'Functions with variable number of arguments (like printf).',
        example: dedent(`
      #include <stdio.h>
      #include <stdarg.h>

      double average(int count, ...) {
          va_list args;
          va_start(args, count);
          double sum = 0;
          for (int i = 0; i < count; i++) {
              sum += va_arg(args, double);
          }
          va_end(args);
          return count > 0 ? sum / count : 0;
      }

      int main() {
          printf("Avg of 2:  %.2f\\n", average(2, 10.0, 20.0));
          printf("Avg of 4:  %.2f\\n", average(4, 1.0, 2.0, 3.0, 4.0));
          printf("Avg of 3:  %.2f\\n", average(3, 5.5, 10.3, 15.7));
          return 0;
      }
    `)
    },
    {
        id: 'static-array',
        title: 'Static vs Dynamic Arrays',
        description: 'Understanding stack vs heap allocation.',
        example: dedent(`
      #include <stdio.h>
      #include <stdlib.h>

      void print_static(int arr[], int size) {
          printf("Static array inside function:\\n");
          for (int i = 0; i < size; i++) {
              printf("%d ", arr[i]);
          }
          printf("\\n");
      }

      int main() {
          // Stack-allocated (static size)
          int fixed[5] = {1, 2, 3, 4, 5};

          // Heap-allocated (dynamic)
          int n = 5;
          int* dynamic = malloc(n * sizeof(int));
          for (int i = 0; i < n; i++) dynamic[i] = (i + 1) * 10;

          print_static(fixed, 5);
          printf("Dynamic array: ");
          for (int i = 0; i < n; i++) printf("%d ", dynamic[i]);
          printf("\\n");

          free(dynamic);
          return 0;
      }
    `)
    },
]

export default topics
