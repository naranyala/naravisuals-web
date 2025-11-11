---
isReadyToPublish: false
---

# How to Run "Hello World" in Umka Programming Language

Umka is a statically typed embeddable scripting language designed for simplicity and flexibility. Running a "Hello World" program in Umka is straightforward and a great way to get started with this language.

## Step 1: Install Umka

First, ensure you have Umka installed on your system. You can download it from its GitHub repository or relevant release page. Installation usually involves downloading the binary or compiling from source.

## Step 2: Create the Hello World Program

Create a new text file named `hello.um` with the following content:

```umka
package main

func main() {
    println("Hello, World!")
}
```

This is the basic structure for an Umka program. The `package main` declaration indicates the package, and the `main` function is the entry point. The `println` function prints a line to the console.

## Step 3: Compile and Run the Program

Open your terminal or command prompt in the directory containing `hello.um`. Compile and run the program using the Umka compiler as follows:

```sh
umka hello.um
```

This command compiles and runs your program directly, outputting:

```
Hello, World!
```

Alternatively, you can compile to a binary and run separately if desired.

## Summary

Running "Hello World" in Umka involves creating a simple source file with a `main` function that calls `println`, then compiling and running it with the Umka compiler. This process demonstrates the clear syntax and ease of use of Umka for scripting and embedded application development.

For more detailed documentation and examples, check the official Umka resources on GitHub and related community discussions.[1][2][3]

[1](https://github.com/vtereshkov/umka-lang)
[2](https://www.reddit.com/r/ProgrammingLanguages/comments/gf5w0p/umka_a_new_statically_typed_scripting_language/)
[3](https://betterprogramming.pub/the-umka-scripting-language-and-the-tophat-game-framework-ced0d5dc3dd8)
