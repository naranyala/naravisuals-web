---
title: Memory Layout in C
date: Jan 10, 2025
description: Understanding virtual memory and memory layout in C programs
---

# Memory Layout in C Programs

When a C program is compiled and loaded into memory, it occupies a specific layout known as the **process address space**.

## The Memory Regions

```mermaid
flowchart TB
    subgraph Kernel Space ["Kernel Space (OS)"]
    end

    subgraph User Space ["User Space"]
        Stack["Stack<br/>⬇️ grows down"]
        Heap["Heap<br/>⬆️ grows up"]
        BSS["BSS<br/>Uninitialized data"]
        Data["Data<br/>Initialized data"]
        Text["Text/Code<br/>Program code"]
    end

    Kernel Space --> 0x0
    Text --> 0x400000
    Data --> Text
    BSS --> Data
    Heap --> BSS
    Stack --> Heap
    Stack --> 0x7FFFFFFFFFFF
```

## Stack vs Heap

The stack and heap grow towards each other:

| Region | Growth Direction | Allocation Speed | Lifetime |
|--------|-----------------|------------------|----------|
| Stack | ↓ Down | O(1) | Function scope |
| Heap | ↑ Up | O(n) | Manual control |

## Math in Memory Layout

The virtual address space size on 64-bit systems:

$$2^{64} = 18446744073709551616 \text{ bytes}$$

But actually usable per process:

$$2^{48} = 281474976710656 \text{ bytes} = 256 \text{ TB}$$

## Example: Pointer Arithmetic

```c
int arr[] = {10, 20, 30, 40, 50};
int *p = arr;

printf("%d\n", *p);       // 10
printf("%d\n", *(p + 2)); // 30
printf("%d\n", p[4]);     // 50
```

The array `arr` is located in the **Data segment** if it's global, or on the **Stack** if local.
