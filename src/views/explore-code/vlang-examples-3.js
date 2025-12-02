// topics.vlang.part2.js
// Advanced & unique V features you’ll love

function dedent(str) {
    const lines = str.split('\n')
    const nonEmpty = lines.filter(l => l.trim())
    if (!nonEmpty.length) return ''
    const indent = Math.min(...nonEmpty.map(l => l.match(/^ */)[0].length))
    return lines.map(l => l.slice(indent)).join('\n').trim()
}

export const topics = [
    {
        id: 'sumtypes',
        title: 'Sum Types (Algebraic Data Types)',
        description: 'Pattern matching on steroids — exhaustiveness checked at compile time.',
        example: dedent(`
      type Expr = Int | Add | Mul

      struct Int { val int }
      struct Add { left Expr; right Expr }
      struct Mul { left Expr; right Expr }

      fn eval(e Expr) int {
          match e {
              Int { return e.val }
              Add { return eval(e.left) + eval(e.right) }
              Mul { return eval(e.left) * eval(e.right) }
          }
      }

      fn main() {
          expr := Mul{ Add{Int{2}, Int{3}}, Int{10} }  // (2 + 3) * 10
          println(eval(expr))  // 50
      }
    `)
    },
    {
        id: 'comptime',
        title: '$for & Compile-Time Loops',
        description: 'Generate code at compile time — zero runtime cost.',
        example: dedent(`
      struct Point[T] {
          x T
          y T
      }

      $for field in Point.fields {
          println('Field: $field.name, Type: $field.typ')
      }

      fn main() {
          $for method in Point.methods {
              println('Method: $method.name')
          }
      }
    `)
    },
    {
        id: 'autofree',
        title: 'Automatic Memory Management (-autofree)',
        description: 'Write GC-like code without a GC — only in -prod with -autofree.',
        example: dedent(`
      // Compile with: v -autofree -prod your_file.v
      fn create_big_string() string {
          mut s := 'Start '
          for i in 0..1000 {
              s += 'very long string $i '
          }
          return s  // All intermediate allocations auto-freed!
      }

      fn main() {
          big := create_big_string()
          println('Length: \${big.len}')
      }
    `)
    },
    {
        id: 'orm',
        title: 'Built-in ORM (No SQL strings)',
        description: 'Type-safe database queries — compile-time checked.',
        example: dedent(`
      import sqlite

      [table: 'users']
      struct User {
          id    int    [primary; sql_serial]
          name  string
          age   int
          is_cool bool [sql: 'is_cool']
      }

      fn main() {
          db := sqlite.connect('users.db') or { panic(err) }
          users := sql db {
              select from User where age > 25 && is_cool == true
          }
          for user in users {
              println('$user.name is $user.age and definitely cool')
          }
      }
    `)
    },
    {
        id: 'hot-reload',
        title: 'Live Code Reloading (hotcode)',
        description: 'Change code while the program runs — instantly applied!',
        example: dedent(`
      import time

      $if hotreload ? {
          println('Hot code reloading enabled!')
      }

      fn main() {
          mut counter := 0
          for {
              println('Counter: $counter  [Edit this file and save!]')
              counter++
              time.sleep(1 * time.second)
          }
      }
    `)
    },
    {
        id: 'c-interop',
        title: 'Direct C Interop (No Bindings)',
        description: 'Call C code directly — no wrapper needed.',
        example: dedent(`
      // Direct C code inside V!
      fn C.puts(&char) int

      fn main() {
          C.puts(c'Hello from C via V!\n')

          // Even call complex C functions
          name := 'V rocks'.str
          C.printf(c'Length of "%s" is %d\\n', name, C.strlen(name))
      }
    `)
    },
    {
        id: 'profile',
        title: 'Built-in Profiler (-profile)',
        description: 'See exactly where time is spent — no external tools needed.',
        example: dedent(`
      fn heavy() {
          mut sum := 0
          for i in 0..10_000_000 {
              sum += i * i
          }
      }

      fn main() {
          for i in 0..5 {
              heavy()
          }
      }
      // Run: v -profile profile.txt your_file.v && cat profile.txt
    `)
    }
]

