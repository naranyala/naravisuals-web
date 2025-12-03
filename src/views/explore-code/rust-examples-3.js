
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

export const topics = [
  {
    id: 'serde',
    title: 'Serialization with Serde',
    description: 'Serialize and deserialize data with Serde.',
    example: dedent(`
      use serde::{Deserialize, Serialize};

      #[derive(Serialize, Deserialize)]
      struct Person {
          name: String,
          age: u8,
      }

      fn main() {
          let p = Person { name: "Alice".into(), age: 30 };
          let json = serde_json::to_string(&p).unwrap();
          println!("{}", json);
      }
    `)
  },
  {
    id: 'futures',
    title: 'Futures and Streams',
    description: 'Working with asynchronous values over time.',
    example: dedent(`
      use futures::stream::{self, StreamExt};

      #[tokio::main]
      async fn main() {
          let stream = stream::iter(vec![1, 2, 3]);
          stream
              .for_each(|n| async move {
                  println!("Item: {}", n);
              })
              .await;
      }
    `)
  },
  {
    id: 'interior-mutability',
    title: 'Interior Mutability',
    description: 'Mutating data inside immutable containers like RefCell.',
    example: dedent(`
      use std::cell::RefCell;

      fn main() {
          let x = RefCell::new(5);
          *x.borrow_mut() += 1;
          println!("Value: {}", x.borrow());
      }
    `)
  },
  {
    id: 'pin',
    title: 'Pinned Data',
    description: 'Ensuring values don’t move in memory with Pin.',
    example: dedent(`
      use std::pin::Pin;
      use std::marker::PhantomPinned;

      #[derive(Debug)]
      struct SelfReferential {
          data: String,
          _pin: PhantomPinned,
      }

      fn main() {
          let val = SelfReferential {
              data: "hello".to_string(),
              _pin: PhantomPinned,
          };
          let pinned = Box::pin(val);
          println!("{:?}", pinned.as_ref());
      }
    `)
  },
  {
    id: 'const-generics',
    title: 'Const Generics',
    description: 'Generic parameters over compile-time constants.',
    example: dedent(`
      struct Array<T, const N: usize> {
          data: [T; N],
      }

      impl<T: Default + Copy, const N: usize> Array<T, N> {
          fn new() -> Self {
              Self { data: [T::default(); N] }
          }
      }

      fn main() {
          let arr = Array::<i32, 4>::new();
          println!("{:?}", arr.data);
      }
    `)
  },
  {
    id: 'atomics',
    title: 'Atomic Types',
    description: 'Lock-free shared state with atomic operations.',
    example: dedent(`
      use std::sync::atomic::{AtomicUsize, Ordering};
      use std::sync::Arc;
      use std::thread;

      fn main() {
          let counter = Arc::new(AtomicUsize::new(0));
          let mut handles = vec![];

          for _ in 0..10 {
              let cnt = Arc::clone(&counter);
              handles.push(thread::spawn(move || {
                  cnt.fetch_add(1, Ordering::SeqCst);
              }));
          }

          for h in handles { h.join().unwrap(); }
          println!("Counter: {}", counter.load(Ordering::SeqCst));
      }
    `)
  }
]
