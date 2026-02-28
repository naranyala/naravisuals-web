---
title: Data Structures and Algorithms
date: Jan 25, 2025
description: Essential algorithms and data structures with complexity analysis
---

# Data Structures and Algorithms

Understanding algorithmic complexity is crucial for efficient programming.

## Big O Notation

Time complexity describes how the runtime grows with input size:

| Notation | Name | Example |
|----------|------|---------|
| $O(1)$ | Constant | Array access |
| $O(\log n)$ | Logarithmic | Binary search |
| $O(n)$ | Linear | Linear search |
| $O(n \log n)$ | Linearithmic | Merge sort |
| $O(n^2)$ | Quadratic | Bubble sort |
| $O(2^n)$ | Exponential | Fibonacci (naive) |

## Binary Tree Operations

```mermaid
flowchart TD
    A[Binary Tree] --> B[Insert]
    A --> C[Delete]
    A --> D[Search]
    A --> E[Traversal]

    B --> B1[Find position]
    B --> B2[Insert leaf]

    C --> C1[Find node]
    C --> C2[Replace with successor]
    C --> C3[Delete leaf]

    D --> D1[Compare values]
    D --> D2[Traverse left/right]

    E --> E1[Inorder: LNR]
    E --> E2[Preorder: NLR]
    E --> E3[Postorder: LRN]
```

## Sorting Algorithm Comparison

```mermaid
graph TD
    A[Sorting Algorithms] --> B[Comparison Sorts]
    A --> C[Non-Comparison Sorts]

    B --> D[Quick Sort]
    B --> E[Merge Sort]
    B --> F[Heap Sort]
    B --> G[Bubble Sort]

    C --> H[Counting Sort]
    C --> I[Radix Sort]
    C --> J[Bucket Sort]

    D --> D1["O(n log n) avg"]
    E --> E1["O(n log n) worst"]
    F --> F1["O(n log n) worst"]
    G --> G1["O(n²) worst"]
```

## Hash Table Implementation

```c
#define TABLE_SIZE 1000

typedef struct {
    char *key;
    int value;
    struct HashNode *next;
} HashNode;

typedef struct {
    HashNode *buckets[TABLE_SIZE];
} HashTable;

unsigned int hash(const char *key) {
    unsigned int hash = 5381;
    int c;
    while ((c = *key++))
        hash = ((hash << 5) + hash) + c;
    return hash % TABLE_SIZE;
}

void insert(HashTable *table, const char *key, int value) {
    unsigned int index = hash(key);
    HashNode *node = malloc(sizeof(HashNode));
    node->key = strdup(key);
    node->value = value;
    node->next = table->buckets[index];
    table->buckets[index] = node;
}
```

## Graph Algorithms

### Breadth-First Search (BFS)

```javascript
function bfs(graph, start) {
    const queue = [start];
    const visited = new Set([start]);
    const result = [];

    while (queue.length > 0) {
        const vertex = queue.shift();
        result.push(vertex);

        for (const neighbor of graph[vertex]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return result;
}
```

### Dijkstra's Algorithm

```python
import heapq

def dijkstra(graph, start):
    queue = [(0, start)]
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0

    while queue:
        current_distance, current_node = heapq.heappop(queue)

        if current_distance > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(queue, (distance, neighbor))

    return distances
```

## Complexity Analysis

For $n$ elements and $k$ buckets in bucket sort:

$$\text{Time Complexity} = O\left(\frac{n^2}{k} + k\right)$$

Optimal bucket count minimizes this function. For uniform distribution:

$$k \approx \sqrt{n}$$

This gives time complexity of $O(n)$ on average.
