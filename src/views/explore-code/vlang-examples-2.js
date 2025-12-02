// topics.vlang.js
// Fresh V language examples for your explorer component

function dedent(str) {
    const lines = str.split('\n')
    const nonEmpty = lines.filter(l => l.trim())
    if (!nonEmpty.length) return ''
    const indent = Math.min(...nonEmpty.map(l => l.match(/^ */)[0].length))
    return lines.map(l => l.slice(indent)).join('\n').trim()
}

export const topics = [
    {
        id: 'sum-function',
        title: 'Pure Functions',
        description: 'Functions are pure by default and extremely fast.',
        example: dedent(`
      fn add(a int, b int) int {
          return a + b
      }

      fn main() {
          result := add(13, 37)
          println('13 + 37 = $result')   // 13 + 37 = 50
      }
    `)
    },
    {
        id: 'maps',
        title: 'Maps (Hash Tables)',
        description: 'Built-in, fast, and zero-allocation when possible.',
        example: dedent(`
      fn main() {
          mut ages := map{
              'Alice': 28
              'Bob':   35
          }
          ages['Charlie'] = 42

          println(ages['Bob'])          // 35
          println('Alice' in ages)      // true

          for name, age in ages {
              println('$name => $age')
          }
      }
    `)
    },
    {
        id: 'error-handling',
        title: 'Explicit Error Handling',
        description: 'No exceptions — errors are values with ? and or {}.',
        example: dedent(`
      import os

      fn get_username() ?string {
          home := os.environ()['HOME'] or { return error('HOME not set') }
          return os.read_file('$home/.username') or { return err }
      }

      fn main() {
          username := get_username() or {
              eprintln('Could not read username: $err')
              return
          }
          println('Welcome, $username!')
      }
    `)
    },
    {
        id: 'json',
        title: 'Zero-boilerplate JSON',
        description: 'Struct tags make JSON (and others) automatic.',
        example: dedent(`
      import json

      struct User {
          name string
          age  int    [json: user_age]
          tags []string
      }

      fn main() {
          json_str := '{"name":"Samantha","user_age":29,"tags":["dev","vlang"]}'
          user := json.decode(User, json_str) or { panic(err) }

          println(user)                 // User{ name: Samantha, age: 29, tags: [dev, vlang] }
          println(json.encode(user))    // back to JSON
      }
    `)
    },
    {
        id: 'vweb',
        title: 'Web Server (vweb)',
        description: 'Write a full web app in ~15 lines — no framework needed.',
        example: dedent(`
      import vweb

      struct App {
          vweb.Context
      }

      ['/hello/:name']
      pub fn (app &App) hello(name string) vweb.Result {
          return app.text('Hello, $name!')
      }

      fn main() {
          vweb.run(&App{}, 8080)
      }
    `)
    },
    {
        id: 'actor-model',
        title: 'Actor-style Concurrency',
        description: 'Message-passing concurrency with channels.',
        example: dedent(`
      fn worker(id int, ch chan int) {
          for msg := range ch {
              println('Worker $id received $msg')
          }
      }

      fn main() {
          ch := chan int{cap: 10}

          for i in 1..4 {
              go worker(i, ch)
          }

          for i in 1..11 {
              ch <- i * 10
          }
          ch.close()
      }
    `)
    }
]

