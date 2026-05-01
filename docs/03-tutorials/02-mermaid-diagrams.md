---
title: Mastering Mermaid Diagrams
description: A practical guide to creating beautiful, professional diagrams within your documentation.
sidebar_label: Mermaid Diagrams
sidebar_position: 2
tags: ["tutorials", "mermaid", "visuals"]
---

# Mastering Mermaid Diagrams

Mermaid.js allows you you to create complex, interactive diagrams directly within your Markdown using a simple, text-based syntax. This approach ensures your diagrams are version-controlled, easy to edit, and perfectly integrated into the documentation theme.

## 1. The Basics: Flowcharts

Flowcharts are the most versatile diagram type. They are perfect for showing processes, decision paths, and organizational structures.

### Directional Control

You can control the flow of your diagram by specifying a direction at the start:

- `TD` or `TB`: Top Down
- `BT`: Bottom Up
- `LR`: Left to Right
- `RL`: Right to Left

```mermaid:desc=Basic flowchart with direction control
flowchart LR
  A[Start] --> B{Is it working?}
  B -- Yes --> C[Success!]
  B -- No --> D[Fix it]
  D --> B
```

### Node Shapes

Mermaid supports various shapes for your nodes:

- `[Square]` - Default
- `(Rounded)` - Rounded corners
- `([Stadium])` - Stadium shape
- `[[Subroutine]]` - Double borders
- `[(Database)]` - Cylinder shape
- `{{Hexagon}}` - Hexagon
- `((Circle))` - Circle
- `>Asymmetric<` - Asymmetric shape

```mermaid:desc=Demonstrating various node shapes
flowchart TD
  Start([Start Node]) --> Process[Process Step]
  Process --> Db[(Database)]
  Process --> Decision{Decision}
  Decision -->|Yes| Success((Success))
  Decision -->|No| Error{{Error Node}}
```

## 2. Sequence Diagrams

Sequence diagrams are ideal for showing the interaction between different components or services over time. They are particularly useful for explaining complex API calls or system architectures.

```mermaid:desc=A typical API interaction sequence
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Auth as Auth Service
    participant DB as Database

    Client->>API: GET /api/v1/user/123
    API->>Auth: Validate JWT
    Auth-->>API: Token Valid (User: 123)
    API->>DB: Query User 123
    DB-->>API: User Data
    API-->>Client: 200 OK { "name": "John Doe" }
```

## 3. Advanced Features

### Subgraphs

Subgraphs allow you to group related nodes together, providing visual structure to complex diagrams.

```mermaid:desc=Grouping nodes using subgraphs
flowchart TB
    subgraph Frontend
        UI[User Interface]
        State[State Management]
    end

    subgraph Backend
        API[API Server]
        Worker[Background Worker]
    end

    UI --> API
    API --> State
    API --> Worker
```

### Styling Nodes

You can apply custom styles to your nodes using the `style` keyword.

```mermaid:desc=Applying custom styles to nodes
flowchart LR
    A[Default Node] --> B[Styled Node]
    style B fill:#f96,stroke:#333,stroke-width:4px
```

## 4. Best Practices

1.  **Use Descriptive Labels**: Instead of `A[Node A]`, use `A[User Registration]`.
2.  **Keep it Simple**: If a diagram becomes too complex, break it into multiple smaller diagrams or use subgraphs.
3.  **Consistent Directions**: Stick to a consistent direction (e.g., all `LR` or all `TD`) within a single document for a cleaner look.
4.  **Leverage `:desc=`**: Always use the `:desc=` attribute on your code blocks. This provides a title in the UI and improves accessibility.
5.  **Test with Validation**: Use the built-in build-time validation to catch syntax errors early.

## Next Steps

- **[Writing Plugins](./01-writing-plugins)**: Learn how to create your own custom Markdown transformations.
- **[Build Pipeline](../architecture/01-build-pipeline)**: See how these diagrams are processed during the build.
