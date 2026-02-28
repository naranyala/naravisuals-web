<script setup>
import { computed, ref } from 'vue';
import MarkdownRenderer from './MarkdownRenderer.vue';

// Define articles directly with their content
const articles = [
  {
    id: '1',
    title: 'Memory Layout in C',
    date: 'Jan 10, 2025',
    description: 'Understanding virtual memory and memory layout in C programs',
    content: `# Memory Layout in C Programs

When a C program is compiled and loaded into memory, it occupies a specific layout known as the **process address space**.

## The Memory Regions

\`\`\`mermaid
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
\`\`\`

## Stack vs Heap

The stack and heap grow towards each other:

| Region | Growth Direction | Allocation Speed | Lifetime |
|--------|-----------------|------------------|----------|
| Stack | ↓ Down | O(1) | Function scope |
| Heap | ↑ Up | O(n) | Manual control |

## Math in Memory Layout

The virtual address space size on 64-bit systems:

$$2^{64} = 18446744073709551616 \\text{ bytes}$$

But actually usable per process:

$$2^{48} = 281474976710656 \\text{ bytes} = 256 \\text{ TB}$$

## Example: Pointer Arithmetic

\`\`\`c
int arr[] = {10, 20, 30, 40, 50};
int *p = arr;

printf("%d\\n", *p);       // 10
printf("%d\\n", *(p + 2)); // 30
printf("%d\\n", p[4]);     // 50
\`\`\`

The array \`arr\` is located in the **Data segment** if it's global, or on the **Stack** if local.`,
  },
  {
    id: '2',
    title: 'Async JavaScript Patterns',
    date: 'Jan 15, 2025',
    description: 'Understanding async/await, promises, and event loop',
    content: `# Async JavaScript Patterns

JavaScript's asynchronous nature is fundamental to modern web development.

## The Event Loop

\`\`\`mermaid
flowchart LR
    CallStack["Call Stack"] --> WebAPIs["Web APIs"]
    WebAPIs --> CallbackQueue["Callback Queue"]
    CallbackQueue --> EventLoop["Event Loop"]
    EventLoop --> CallStack

    style CallStack fill:#e1f5fe
    style WebAPIs fill:#fff3e0
    style CallbackQueue fill:#f3e5f5
    style EventLoop fill:#e8f5e8
\`\`\`

## Promise States

\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Fulfilled: resolve()
    Pending --> Rejected: reject()
    Fulfilled --> [*]
    Rejected --> [*]
\`\`\`

## Basic Patterns

### Promise Chain

\`\`\`javascript
fetchData()
  .then(process)
  .then(save)
  .catch(handleError);
\`\`\`

### Async/Await

\`\`\`javascript
async function getUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(userId);
    return { user, posts };
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}
\`\`\`

### Parallel Execution

\`\`\`javascript
const [users, posts, comments] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchComments()
]);
\`\`\`

### Race Condition

\`\`\`javascript
const result = await Promise.race([
  fetchData(timeout=5000),
  timeoutReject(5500)
]);
\`\`\`

## Math: Throughput Calculation

For $n$ concurrent requests with average latency $t$:

$$\\text{Throughput} = \\frac{n}{t \\times n + \\text{overhead}}$$`,
  },
  {
    id: '3',
    title: 'Rust Ownership Deep Dive',
    date: 'Jan 20, 2025',
    description: 'Understanding Rust ownership system and memory safety',
    content: `# Rust Ownership System

Rust's ownership model ensures memory safety without garbage collection.

## The Three Rules

\`\`\`mermaid
flowchart TB
    subgraph Ownership ["Ownership Rules"]
        A["1. Each value has an owner"]
        B["2. One owner at a time"]
        C["3. Owner goes out of scope → value dropped"]
    end
\`\`\`

## Borrowing

\`\`\`mermaid
flowchart LR
    String["String<br/>owner: s1"] -->|"borrow (&)|" Ref["&String<br/>reference"]
    String -->|"mutate (&mut)|" MutRef["&mut String<br/>mutable reference"]

    style String fill:#e3f2fd
    style Ref fill:#fff3e0
    style MutRef fill:#fce4ec
\`\`\`

## Ownership in Action

\`\`\`rust
fn main() {
    // s1 owns the String
    let s1 = String::from("hello");

    // s2 takes ownership
    let s2 = s1;

    // println!("{}", s1); // ERROR: s1 is no longer valid
    println!("{}", s2);   // OK: s2 owns the data

    // Borrowing with references
    let len = calculate_length(&s2);
    println!("Length of '{}' is {}", s2, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s goes out of scope but doesn't drop the value
\`\`\`

## The Borrow Checker

\`\`\`mermaid
flowchart TB
    subgraph Valid ["Valid Scopes"]
        A["Variable scope"]
        B["Reference scope"]
        A -->|contains| B
    end

    subgraph Invalid ["Invalid - Won't Compile"]
        C["Variable scope"]
        D["Reference scope longer"]
        C -->|gap| D
    end

    style Valid fill:#e8f5e9
    style Invalid fill:#ffebee
\`\`\`

## Lifetimes

\`\`\`rust
fn longest<'a>(s1: &'a str, s2: &'a str) -> &'a str {
    if s1.len() > s2.len() {
        s1
    } else {
        s2
    }
}
\`\`\`

The \`'a\` lifetime annotation means: "The returned reference will live as long as the shorter of the two input references."

## Math: Move Semantics Performance

For $n$ elements, moving is $O(1)$ while cloning is $O(n)$:

$$\\text{Copy time} = n \\times \\text{element\\_size}$$

$$\\text{Move time} = 1 \\times \\text{pointer\\_size}$$`,
  },
  {
    id: '4',
    title: 'Data Structures and Algorithms',
    date: 'Jan 25, 2025',
    description:
      'Essential algorithms and data structures with complexity analysis',
    content: `# Data Structures and Algorithms

Understanding algorithmic complexity is crucial for efficient programming.

## Big O Notation

Time complexity describes how the runtime grows with input size:

| Notation | Name | Example |
|----------|------|---------|
| $O(1)$ | Constant | Array access |
| $O(\\log n)$ | Logarithmic | Binary search |
| $O(n)$ | Linear | Linear search |
| $O(n \\log n)$ | Linearithmic | Merge sort |
| $O(n^2)$ | Quadratic | Bubble sort |
| $O(2^n)$ | Exponential | Fibonacci (naive) |

## Binary Tree Operations

\`\`\`mermaid
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
\`\`\`

## Sorting Algorithm Comparison

\`\`\`mermaid
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
\`\`\`

## Hash Table Implementation

\`\`\`c
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
\`\`\`

## Graph Algorithms

### Breadth-First Search (BFS)

\`\`\`javascript
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
\`\`\`

### Dijkstra's Algorithm

\`\`\`python
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
\`\`\`

## Complexity Analysis

For $n$ elements and $k$ buckets in bucket sort:

$$\\text{Time Complexity} = O\\left(\\frac{n^2}{k} + k\\right)$$

Optimal bucket count minimizes this function. For uniform distribution:

$$k \\approx \\sqrt{n}$$

This gives time complexity of $O(n)$ on average.`,
  },
  {
    id: '5',
    title: 'Network Programming Fundamentals',
    date: 'Jan 30, 2025',
    description: 'TCP/IP, sockets, and network protocols explained',
    content: `# Network Programming Fundamentals

Understanding network communication is essential for modern application development.

## OSI Model vs TCP/IP Model

\`\`\`mermaid
graph TD
    subgraph OSI ["OSI Model (7 Layers)"]
        A1[Application Layer]
        A2[Presentation Layer]
        A3[Session Layer]
        A4[Transport Layer]
        A5[Network Layer]
        A6[Data Link Layer]
        A7[Physical Layer]
    end

    subgraph TCPIP ["TCP/IP Model (4 Layers)"]
        B1[Application Layer]
        B2[Transport Layer]
        B3[Internet Layer]
        B4[Network Access Layer]
    end

    A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7
    B1 --> B2 --> B3 --> B4

    style A1 fill:#e1f5fe
    style B1 fill:#fff3e0
\`\`\`

## TCP Three-Way Handshake

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: SYN (seq=x)
    Server->>Client: SYN-ACK (seq=y, ack=x+1)
    Client->>Server: ACK (ack=y+1)

    Note over Client,Server: Connection Established
\`\`\`

## Socket Programming in C

### TCP Server

\`\`\`c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>

int main() {
    int sockfd, newsockfd, portno = 8080;
    socklen_t clilen;
    char buffer[256];
    struct sockaddr_in serv_addr, cli_addr;
    int n;

    // Create socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("ERROR opening socket");
        exit(1);
    }

    // Initialize server address structure
    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = INADDR_ANY;
    serv_addr.sin_port = htons(portno);

    // Bind socket to address
    if (bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) {
        perror("ERROR on binding");
        exit(1);
    }

    // Listen for connections
    listen(sockfd, 5);
    clilen = sizeof(cli_addr);

    // Accept connection
    newsockfd = accept(sockfd, (struct sockaddr *) &cli_addr, &clilen);
    if (newsockfd < 0) {
        perror("ERROR on accept");
        exit(1);
    }

    // Read and write data
    bzero(buffer, 256);
    n = read(newsockfd, buffer, 255);
    if (n < 0) {
        perror("ERROR reading from socket");
        exit(1);
    }

    printf("Received: %s\\n", buffer);
    n = write(newsockfd, "Message received", 16);
    if (n < 0) {
        perror("ERROR writing to socket");
        exit(1);
    }

    close(newsockfd);
    close(sockfd);
    return 0;
}
\`\`\`

## HTTP Protocol

### Request/Response Cycle

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: GET / HTTP/1.1<br/>Host: example.com<br/>User-Agent: curl/7.68.0
    Server->>Client: HTTP/1.1 200 OK<br/>Content-Type: text/html<br/>Content-Length: 1234<br/><br/><html>...</html>
\`\`\`

## WebSocket Protocol

\`\`\`javascript
// Server (Node.js with ws)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);
        ws.send('Echo: ' + message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
\`\`\`

\`\`\`javascript
// Client (Browser)
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to WebSocket');
    ws.send('Hello Server!');
};

ws.onmessage = (event) => {
    console.log('Received:', event.data);
};

ws.onclose = () => {
    console.log('Connection closed');
};
\`\`\`

## Network Security

### SSL/TLS Handshake

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: ClientHello (supported ciphers)
    Server->>Client: ServerHello (chosen cipher)<br/>Certificate<br/>ServerHelloDone
    Client->>Server: ClientKeyExchange<br/>ChangeCipherSpec<br/>Finished
    Server->>Client: ChangeCipherSpec<br/>Finished

    Note over Client,Server: Encrypted communication begins
\`\`\`

## Performance Considerations

Network latency and bandwidth affect application performance:

$$\\text{Round-trip time (RTT)} = 2 \\times \\text{Propagation Delay}$$

$$\\text{Throughput} = \\frac{\\text{Window Size}}{\\text{RTT}}$$

For TCP congestion control:

$$\\text{Congestion Window} = \\min(\\text{Receiver Window}, \\text{Congestion Window})$$

These formulas help optimize network applications for better performance.`,
  },
  {
    id: '6',
    title: 'Machine Learning Fundamentals',
    date: 'Feb 5, 2025',
    description:
      'Core concepts of machine learning with mathematical foundations',
    content: `# Machine Learning Fundamentals

Machine learning is the study of algorithms that learn patterns from data.

## Learning Paradigms

\`\`\`mermaid
graph TD
    A[Machine Learning] --> B[Supervised Learning]
    A --> C[Unsupervised Learning]
    A --> D[Reinforcement Learning]

    B --> B1[Classification]
    B --> B2[Regression]

    C --> C1[Clustering]
    C --> C2[Dimensionality Reduction]

    D --> D1[Policy Learning]
    D --> D2[Value Learning]

    B1 --> B11["Decision Trees, SVM, Neural Networks"]
    B2 --> B21["Linear Regression, Polynomial Regression"]
    C1 --> C11["K-Means, DBSCAN, Hierarchical"]
    C2 --> C21["PCA, t-SNE, Autoencoders"]
\`\`\`

## Linear Regression

### Mathematical Foundation

For a dataset with $n$ samples and $m$ features:

$$\\mathbf{X} = \\begin{bmatrix}
x_{11} & x_{12} & \\cdots & x_{1m} \\\\
x_{21} & x_{22} & \\cdots & x_{2m} \\\\
\\vdots & \\vdots & \\ddots & \\vdots \\\\
x_{n1} & x_{n2} & \\cdots & x_{nm}
\\end{bmatrix}, \\quad
\\mathbf{y} = \\begin{bmatrix}
y_1 \\\\
y_2 \\\\
\\vdots \\\\
y_n
\\end{bmatrix}$$

The linear model:

$$\\hat{y}_i = w_0 + w_1 x_{i1} + w_2 x_{i2} + \\cdots + w_m x_{im} = \\mathbf{w}^T \\mathbf{x}_i$$

### Cost Function

Mean Squared Error (MSE):

$$J(\\mathbf{w}) = \\frac{1}{2n} \\sum_{i=1}^n (\\hat{y}_i - y_i)^2$$

### Gradient Descent

Update rule for parameter $w_j$:

$$w_j := w_j - \\alpha \\frac{\\partial J}{\\partial w_j}$$

Partial derivative:

$$\\frac{\\partial J}{\\partial w_j} = \\frac{1}{n} \\sum_{i=1}^n (\\hat{y}_i - y_i) x_{ij}$$

## Neural Networks

### Single Neuron Model

\`\`\`mermaid
flowchart LR
    subgraph Input
        x1["x₁"]
        x2["x₂"]
        x3["x₃"]
    end

    subgraph Neuron
        w1["w₁"]
        w2["w₂"]
        w3["w₃"]
        sigma["∑"]
        f["f(z)"]
    end

    subgraph Output
        y["ŷ"]
    end

    x1 --> w1 --> sigma
    x2 --> w2 --> sigma
    x3 --> w3 --> sigma
    sigma --> f --> y
\`\`\`

### Activation Functions

| Function | Formula | Derivative | Range |
|----------|---------|------------|-------|
| Sigmoid | $\\sigma(z) = \\frac{1}{1 + e^{-z}}$ | $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$ | (0, 1) |
| Tanh | $\\tanh(z) = \\frac{e^z - e^{-z}}{e^z + e^{-z}}$ | $1 - \\tanh^2(z)$ | (-1, 1) |
| ReLU | $\\max(0, z)$ | $1$ if $z > 0$, else $0$ | [0, ∞) |
| Leaky ReLU | $\\max(0.01z, z)$ | $1$ if $z > 0$, else $0.01$ | (-∞, ∞) |

### Backpropagation

For a neural network with $L$ layers:

1. **Forward pass**: Compute activations layer by layer
2. **Backward pass**: Compute gradients from output to input

For layer $l$, error term:

$$\\delta^{(l)} = \\frac{\\partial J}{\\partial z^{(l)}}$$

Weight update:

$$\\mathbf{W}^{(l)} := \\mathbf{W}^{(l)} - \\alpha \\frac{\\partial J}{\\partial \\mathbf{W}^{(l)}}$$

## Convolutional Neural Networks (CNNs)

### Convolution Operation

For input $\\mathbf{X}$ and kernel $\\mathbf{K}$:

$$(\\mathbf{X} * \\mathbf{K})_{i,j} = \\sum_m \\sum_n \\mathbf{X}_{i+m,j+n} \\mathbf{K}_{m,n}$$

### CNN Architecture

\`\`\`mermaid
flowchart LR
    Input["Input Image<br/>32×32×3"] --> Conv1["Conv Layer<br/>5×5×32"]
    Conv1 --> Pool1["Max Pool<br/>2×2"]
    Pool1 --> Conv2["Conv Layer<br/>5×5×64"]
    Conv2 --> Pool2["Max Pool<br/>2×2"]
    Pool2 --> Flatten["Flatten"]
    Flatten --> FC1["Fully Connected<br/>512"]
    FC1 --> FC2["Fully Connected<br/>10"]
    FC2 --> Output["Softmax<br/>Output"]

    style Input fill:#e3f2fd
    style Conv1 fill:#fff3e0
    style Pool1 fill:#f3e5f5
    style Output fill:#e8f5e9
\`\`\`

## Training Best Practices

### Data Splitting

\`\`\`python
from sklearn.model_selection import train_test_split

# Split data: 60% train, 20% validation, 20% test
X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.4, random_state=42)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
\`\`\`

### Regularization Techniques

1. **L2 Regularization** (Weight Decay):
   $$J(\\mathbf{w}) = J_0(\\mathbf{w}) + \\frac{\\lambda}{2} \\|\\mathbf{w}\\|^2$$

2. **Dropout**:
   - Randomly zero out neurons during training
   - Prevents co-adaptation of features

3. **Early Stopping**:
   - Monitor validation loss
   - Stop when validation loss stops decreasing

### Cross-Validation

\`\`\`python
from sklearn.model_selection import cross_val_score

# K-fold cross-validation
scores = cross_val_score(model, X, y, cv=5)
print(f"Mean accuracy: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
\`\`\`

## Evaluation Metrics

### Classification Metrics

For binary classification:

| Metric | Formula |
|--------|---------|
| Accuracy | $\\frac{TP + TN}{TP + TN + FP + FN}$ |
| Precision | $\\frac{TP}{TP + FP}$ |
| Recall | $\\frac{TP}{TP + FN}$ |
| F1-Score | $2 \\times \\frac{Precision \\times Recall}{Precision + Recall}$ |

### Confusion Matrix

\`\`\`
Predicted →   Positive    Negative
Actual ↓
Positive         TP          FN
Negative         FP          TN
\`\`\`

## Overfitting vs Underfitting

\`\`\`mermaid
graph LR
    subgraph Underfitting
        A["High Bias<br/>Poor performance on train & test"]
    end

    subgraph Good_Fit ["Good Fit"]
        B["Balanced bias-variance<br/>Good performance on both"]
    end

    subgraph Overfitting
        C["High Variance<br/>Excellent on train, poor on test"]
    end

    style A fill:#ffebee
    style B fill:#e8f5e9
    style C fill:#fff3e0
\`\`\`

## Gradient Boosting

### Algorithm Overview

1. Initialize model with constant prediction
2. For each iteration:
   - Compute pseudo-residuals
   - Fit weak learner to residuals
   - Update model by adding scaled weak learner

### XGBoost Objective

$$Obj = \\sum_i l(y_i, \\hat{y}_i) + \\sum_k \\Omega(f_k)$$

Where:
- $l$ is the loss function
- $\\Omega(f) = \\gamma T + \\frac{1}{2} \\lambda \\|\\mathbf{w}\\|^2$ is the regularization term

This comprehensive foundation covers the core concepts needed for machine learning applications.`,
  },
];

const selected = ref(null);
const search = ref('');

const filtered = computed(() =>
  articles.filter((a) =>
    a.title?.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const article = computed(() => articles.find((a) => a.id === selected.value));

const selectArticle = (article) => {
  selected.value = article.id;
};

const closeArticle = () => {
  selected.value = null;
};
</script>

<template>
  <div class="article-reader">
    <div v-if="!selected">
      <h1 class="title">Articles</h1>

      <input
        type="text"
        placeholder="Search articles..."
        v-model="search"
        class="search"
      />

      <div class="list">
        <div
          v-for="a in filtered"
          :key="a.id"
          class="card"
          @click="selectArticle(a)"
        >
          <h3 class="card-title">{{ a.title }}</h3>
          <p class="card-desc">{{ a.description }}</p>
          <div class="date">{{ a.date }}</div>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="no-results">
        No articles found
      </div>
    </div>

    <div v-else class="article-view">
      <div class="article-header">
        <button class="back-btn" @click="closeArticle">← Back to Articles</button>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="date">{{ article.date }}</span>
        </div>
      </div>

      <div class="article-body">
        <MarkdownRenderer :content="article.content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-reader {
  min-height: calc(100vh - 100px);
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.title {
  font-size: 20px;
  margin-bottom: 20px;
  color: #f1f5f9;
}

.search {
  width: 100%;
  padding: 14px 18px;
  margin-bottom: 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.search:focus {
  border-color: #475569;
  background: #252f3f;
}

.search::placeholder {
  color: #64748b;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  border-color: #475569;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-title {
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  color: #f1f5f9;
}

.card-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.date {
  font-size: 0.85rem;
  color: #64748b;
}

.no-results {
  text-align: center;
  color: #64748b;
  padding: 40px;
}

.article-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.article-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #334155;
}

.back-btn {
  background: transparent;
  border: 1px solid #334155;
  padding: 8px 16px;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #1e293b;
  color: #e2e8f0;
}

.article-title {
  font-size: 2rem;
  margin: 0 0 8px 0;
  color: #f1f5f9;
  font-weight: 600;
}

.article-meta {
  color: #64748b;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .article-reader {
    padding: 12px;
  }

  .list {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 16px;
  }
}
</style>
