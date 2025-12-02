
// Utility: dedent template literals
function dedent(str) {
    const lines = str.split('\n')
    const nonEmpty = lines.filter(l => l.trim())
    if (!nonEmpty.length) return ''
    const indent = Math.min(...nonEmpty.map(l => l.match(/^ */)[0].length))
    return lines.map(l => l.slice(indent)).join('\n').trim()
}

// V Language Topics
export const topics = [
    {
        id: 'hello-world',
        title: 'Hello, World!',
        description: 'The simplest program in V — no semicolons needed.',
        example: dedent(`
      fn main() {
          println('Hello, World!')
      }
    `)
    },
    {
        id: 'variables',
        title: 'Variables & Mutability',
        description: 'Immutable by default. Use "mut" when you need mutation.',
        example: dedent(`
      fn main() {
          name := 'Ada Lovelace'     // immutable, type inferred
          mut age := 30              // explicitly mutable
          age += 1

          println('$name is $age years old')
      }
    `)
    },
    {
        id: 'arrays',
        title: 'Arrays & Slices',
        description: 'Dynamic arrays with built-in bounds checking (in safe mode).',
        example: dedent(`
      fn main() {
          mut numbers := [1, 2, 3]
          numbers << 4               // append
          numbers << [5, 6]          // append multiple

          println(numbers)           // [1, 2, 3, 4, 5, 6]

          for i, n in numbers {
              println('$i: $n')
          }
      }
    `)
    },
    {
        id: 'structs',
        title: 'Structs',
        description: 'Simple, fast, and support methods and embedding.',
        example: dedent(`
      struct Point {
          x int
          y int
      }

      fn (p Point) str() string {
          return '($p.x, $p.y)'
      }

      fn (p Point) distance() f64 {
          return math.sqrt(f64(p.x * p.x + p.y * p.y))
      }

      fn main() {
          p := Point{3, 4}
          println(p)                 // (3, 4)
          println(p.distance())      // 5.0
      }
    `)
    },
    {
        id: 'option-result',
        title: 'Option / Result Types',
        description: 'No null — use ?T for optional values. Errors are explicit.',
        example: dedent(`
      import os

      fn read_file(path string) ?string {
          content := os.read_file(path) or { return error('Failed to read $path') }
          return content
      }

      fn main() {
          data := read_file('data.txt') or {
              println('Error: $err')
              return
          }
          println(data.trim())
      }
    `)
    },
    {
        id: 'generics',
        title: 'Generics',
        description: 'Compile-time generics — zero overhead.',
        example: dedent(`
      fn print_array[T](arr []T) {
          for item in arr {
              print('$item ')
          }
          println('')
      }

      fn main() {
          print_array([1, 2, 3])                    // works with ints
          print_array(['V', 'is', 'awesome'])       // works with strings
      }
    `)
    },
    {
        id: 'concurrency',
        title: 'Go Routines',
        description: 'Lightweight threads with "go" keyword — like Go, but simpler.',
        example: dedent(`
      import time

      fn task(id int) {
          println('Task $id starting')
          time.sleep(1 * time.second)
          println('Task $id done')
      }

      fn main() {
          for i in 1..6 {
              go task(i)
          }
          // Main thread waits a bit so we see output
          time.sleep(3 * time.second)
      }
    `)
    }
]

