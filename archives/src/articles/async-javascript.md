---
title: Async JavaScript Patterns
date: Jan 15, 2025
description: Understanding async/await, promises, and event loop
---

# Async JavaScript Patterns

JavaScript's asynchronous nature is fundamental to modern web development.

## The Event Loop

```mermaid
flowchart LR
    CallStack["Call Stack"] --> WebAPIs["Web APIs"]
    WebAPIs --> CallbackQueue["Callback Queue"]
    CallbackQueue --> EventLoop["Event Loop"]
    EventLoop --> CallStack

    style CallStack fill:#e1f5fe
    style WebAPIs fill:#fff3e0
    style CallbackQueue fill:#f3e5f5
    style EventLoop fill:#e8f5e8
```

## Promise States

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Fulfilled: resolve()
    Pending --> Rejected: reject()
    Fulfilled --> [*]
    Rejected --> [*]
```

## Basic Patterns

### Promise Chain

```javascript
fetchData()
  .then(process)
  .then(save)
  .catch(handleError);
```

### Async/Await

```javascript
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
```

### Parallel Execution

```javascript
const [users, posts, comments] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchComments()
]);
```

### Race Condition

```javascript
const result = await Promise.race([
  fetchData(timeout=5000),
  timeoutReject(5500)
]);
```

## Math: Throughput Calculation

For $n$ concurrent requests with average latency $t$:

$$\text{Throughput} = \frac{n}{t \times n + \text{overhead}}$$
