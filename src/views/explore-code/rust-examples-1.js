
// Utility to dedent code (remove common leading whitespace)
function dedent(str) {
  const lines = str.split('\n')
  const nonEmptyLines = lines.filter(line => line.trim() !== '')
  const minIndent = Math.min(
    ...nonEmptyLines.map(line => {
      const match = line.match(/^ */)
      return match ? match[0].length : 0
    })
  )
  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim()
}

// Rust topics
export const topics = [
  {
    id: 'basics',
    title: 'Rust Basics',
    description: 'Ownership, borrowing, and lifetimes explained.',
    example: dedent(`
      fn main() {
          let x = 5;
          let y = &x;
          println!("y: {}", y);
      }
    `)
  },
  {
    id: 'concurrency',
    title: 'Concurrency',
    description: 'Exploring threads and async in Rust.',
    example: dedent(`
      use std::thread;

      fn main() {
          let handle = thread::spawn(|| {
              println!("Hello from a thread!");
          });
          handle.join().unwrap();
      }
    `)
  },
  {
    id: 'ffi',
    title: 'FFI',
    description: 'Calling Rust from C or vice versa.',
    example: dedent(`
      #[no_mangle]
      pub extern "C" fn add(a: i32, b: i32) -> i32 {
          a + b
      }
    `)
  },
  {
    id: 'macros',
    title: 'Macros',
    description: 'Declarative macros for code generation.',
    example: dedent(`
      macro_rules! say_hello {
          () => {
              println!("Hello, Rust!");
          };
      }

      fn main() {
          say_hello!();
      }
    `)
  },
  {
    id: 'wasm',
    title: 'WebAssembly',
    description: 'Compiling Rust to WebAssembly.',
    example: dedent(`
      use wasm_bindgen::prelude::*;

      #[wasm_bindgen]
      pub fn greet(name: &str) {
          alert(&format!("Hello, {}!", name));
      }
    `)
  },
  {
    id: 'unsafe',
    title: 'Unsafe Rust',
    description: 'Exploring unsafe blocks and raw pointers.',
    example: dedent(`
      fn main() {
          let x: i32 = 42;
          let ptr: *const i32 = &x;

          unsafe {
              println!("Value via raw pointer: {}", *ptr);
          }
      }
    `)
  }
]

