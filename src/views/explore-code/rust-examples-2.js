

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
  id: 'error-handling',
  title: 'Error Handling',
  description: 'Using Result and Option for robust error management.',
  example: dedent(`
    fn divide(a: f64, b: f64) -> Option<f64> {
        if b == 0.0 {
            None
        } else {
            Some(a / b)
        }
    }

    fn main() {
        match divide(10.0, 2.0) {
            Some(val) => println!("Result: {}", val),
            None => println!("Cannot divide by zero!"),
        }
    }
  `)
},
{
  id: 'traits',
  title: 'Traits',
  description: 'Defining shared behavior with traits.',
  example: dedent(`
    trait Greet {
        fn greet(&self);
    }

    struct Person {
        name: String,
    }

    impl Greet for Person {
        fn greet(&self) {
            println!("Hello, I'm {}!", self.name);
        }
    }

    fn main() {
        let p = Person { name: "Alice".to_string() };
        p.greet();
    }
  `)
},
{
  id: 'generics',
  title: 'Generics',
  description: 'Writing flexible and reusable code with type parameters.',
  example: dedent(`
    fn first<T>(list: &[T]) -> Option<&T> {
        list.first()
    }

    fn main() {
        let numbers = vec![1, 2, 3];
        let words = vec!["a", "b", "c"];

        println!("{:?}", first(&numbers));
        println!("{:?}", first(&words));
    }
  `)
},
{
  id: 'async-await',
  title: 'Async/Await',
  description: 'Writing asynchronous code with async/await syntax.',
  example: dedent(`
    use tokio;

    #[tokio::main]
    async fn main() {
        let task = tokio::spawn(async {
            println!("Running async task...");
        });

        task.await.unwrap();
    }
  `)
},
{
  id: 'pattern-matching',
  title: 'Pattern Matching',
  description: 'Using match and destructuring for control flow.',
  example: dedent(`
    enum Message {
        Quit,
        Echo(String),
    }

    fn handle_msg(msg: Message) {
        match msg {
            Message::Quit => println!("Quitting..."),
            Message::Echo(s) => println!("Echo: {}", s),
        }
    }

    fn main() {
        handle_msg(Message::Echo("Hello!".to_string()));
    }
  `)
},
{
  id: 'modules',
  title: 'Modules and Crates',
  description: 'Organizing code with modules and visibility rules.',
  example: dedent(`
    mod math {
        pub fn square(x: i32) -> i32 {
            x * x
        }
    }

    fn main() {
        println!("Square of 5 is {}", math::square(5));
    }
  `)
}

]
