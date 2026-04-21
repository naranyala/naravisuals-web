---
title: Timeline Visuals
description: Learn how to create professional ASCII timelines in your documentation using the timeline code block.
sidebar_label: Timeline Visuals
sidebar_position: 9
tags: ["visuals", "timeline", "ascii", "roadmap"]
---

# Timeline Visuals

The documentation system supports a custom `timeline` code block that allows you to render structured ASCII-art timelines. These are perfect for project roadmaps, historical sequences, or technical workflows where a full Mermaid diagram might be too complex or rigid.

## Basic Usage

To create a timeline, use the code block language `text (timeline)` or simply `timeline`. You can also add a description using the `:desc=` attribute.

### The Modern Vertical Track

Best for detailed histories or "git-style" logs.

```text (timeline):desc=Project roadmap for 2024-2025
[2024]
  |
  ●-- Project Kickoff ----------------------- [Q1]
  |   (Initial architecture and team sync)
  |
  ●-- Alpha Release ------------------------- [Q2]
  |   (Core features implemented)
  |
  ▼
[2025]
  |
  ●-- Beta Testing -------------------------- [Q1]
  |   (Internal QA and feedback loops)
  |
  └───→ Final Deployment [LIVE]
```

### The Horizontal Milestone Bar

Best for high-level overviews or roadmaps.

```timeline:desc=Phase-based development workflow
 PHASE 1          PHASE 2          PHASE 3
 [Setup] -------- [Build] -------- [Launch]
    |                |                |
    ▼                ▼                ▼
 10 Jan           22 Mar           15 June
 (Config)        (Dev Ops)        (Public)
```

### The "Process Flow" Timeline

Best for technical sequences or data pipelines.

```timeline:desc=Data transformation pipeline
[START]      [TRANSFORM]      [VALIDATE]       [END]
  |               |               |              |
  |---(Data)-----»|               |              |
                  |---(JSON)-----»|              |
                                  |---(HTML)----»|
```

## Advanced Formatting

Since the timeline block preserves all whitespace and uses a monospace font, you can get creative with symbols to represent different states:

| Symbol | Suggested Meaning |
| :--- | :--- |
| `●` | Completed Milestone |
| `○` | Pending Milestone |
| `▼` | Year/Phase Transition |
| `»` | Directional Flow |
| `×` | Cancelled / Error |

### Example with Status Indicators

```timeline:desc=Feature development status
[BACKLOG]
  |
  ○-- User Authentication [PLANNED]
  |
  ●-- API Documentation [DONE]
  |
  ●-- Core Engine [DONE]
  |
  ▼
[IN PROGRESS]
  |
  ●-- WebSocket Integration [90%]
  |
  └───→ UI/UX Polish [ACTIVE]
```

## Why use Text Timelines?

1. **Lightweight**: No heavy JavaScript libraries required for rendering.
2. **Version Control Friendly**: They are just text, so changes are easy to see in git diffs.
3. **Copy-Pasteable**: Readers can easily copy the text into their own notes or terminal.
4. **Accessible**: Screen readers can often handle structured text better than complex SVGs.
