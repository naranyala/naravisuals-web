# Mermaid.js Diagram Examples

A comprehensive showcase of all Mermaid diagram types you can use in your markdown articles.

## Table of Contents

- [Flowcharts](#flowcharts)
- [Sequence Diagrams](#sequence-diagrams)
- [Class Diagrams](#class-diagrams)
- [State Diagrams](#state-diagrams)
- [Gantt Charts](#gantt-charts)
- [Pie Charts](#pie-charts)
- [Mind Maps](#mind-maps)
- [Timeline](#timeline)

## Flowcharts

Flowcharts are perfect for showing processes, workflows, and decision trees.

### Basic Flowchart

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D{Did you try turning it off and on?}
    D -->|Yes| E[Have you tried updating?]
    D -->|No| F[Turn it off and on]
    E -->|Yes| G[Time to buy a new one]
    E -->|No| H[Update it]
    F --> B
    H --> B
    C --> I[End]
    G --> I
```

### Complex Process Flow

```mermaid
flowchart LR
    subgraph Planning["Planning Phase"]
        A1[Research] --> A2[Outline]
        A2 --> A3[Gather Assets]
    end
    
    subgraph Creation["Creation Phase"]
        B1[Write Draft] --> B2[Add Images]
        B2 --> B3[Format Content]
    end
    
    subgraph Review["Review Phase"]
        C1[Self Review] --> C2[Peer Review]
        C2 --> C3[Final Edits]
    end
    
    subgraph Publish["Publishing Phase"]
        D1[Upload] --> D2[SEO Optimize]
        D2 --> D3[Publish]
    end
    
    Planning --> Creation
    Creation --> Review
    Review --> Publish
```

### Decision Tree

```mermaid
flowchart TD
    Start[New Blog Post] --> Topic{Topic Chosen?}
    Topic -->|No| Research[Research Trends]
    Topic -->|Yes| Outline[Create Outline]
    Research --> Topic
    Outline --> Content{Content Type?}
    Content -->|Tutorial| Code[Add Code Examples]
    Content -->|Story| Photos[Add Photos]
    Content -->|Guide| Both[Add Both]
    Code --> Edit[Edit Content]
    Photos --> Edit
    Both --> Edit
    Edit --> Publish[Publish!]
```

## Sequence Diagrams

Sequence diagrams show interactions between entities over time.

### Blog Publishing Flow

```mermaid
sequenceDiagram
    participant Author
    participant CMS
    participant Build
    participant Server
    participant CDN
    
    Author->>CMS: Create Draft
    CMS-->>Author: Draft Saved
    Author->>CMS: Submit for Review
    CMS->>Build: Trigger Build
    Build->>Build: Install Dependencies
    Build->>Build: Compile Assets
    Build->>Build: Optimize Images
    Build->>Server: Deploy Files
    Server->>CDN: Invalidate Cache
    CDN-->>Author: Live!
```

### User Authentication

```mermaid
sequenceDiagram
    autonumber
    User->>Login Page: Enter Credentials
    Login Page->>API: POST /login
    API->>Database: Verify User
    Database-->>API: User Data
    API->>API: Validate Password
    API-->>Login Page: JWT Token
    Login Page->>Local Storage: Save Token
    Local Storage-->>User: Dashboard
```

## Class Diagrams

Class diagrams show the structure of systems.

### Blog System Architecture

```mermaid
classDiagram
    class Article {
        +string id
        +string title
        +string content
        +Date publishedAt
        +publish()
        +update()
    }
    
    class Author {
        +string id
        +string name
        +string email
        +getArticles()
        +writeArticle()
    }
    
    class Comment {
        +string id
        +string content
        +Date createdAt
        +approve()
        +delete()
    }
    
    class Category {
        +string id
        +string name
        +getArticles()
    }
    
    Author "1" --> "*" Article
    Article "1" --> "*" Comment
    Article "*" --> "*" Category
```

## State Diagrams

State diagrams show the lifecycle of entities.

### Article Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review: Submit
    Review --> Draft: Request Changes
    Review --> Approved: Approve
    Review --> Rejected: Reject
    Approved --> Scheduled: Schedule
    Scheduled --> Published: Publish Time
    Published --> Archived: Archive
    Published --> Updated: Edit
    Updated --> Published
    Archived --> [*]
    Rejected --> [*]
```

### User Journey

```mermaid
stateDiagram-v2
    [*] --> Visitor
    Visitor --> Subscriber: Subscribe
    Subscriber --> Reader: Read Article
    Reader --> Subscriber: Finish Reading
    Reader --> Commenter: Comment
    Commenter --> Reader: Submit Comment
    Subscriber --> Follower: Follow on Social
    Follower --> [*]
```

## Gantt Charts

Gantt charts show project timelines.

### Blog Content Calendar

```mermaid
gantt
    title Blog Content Schedule - April 2026
    dateFormat  YYYY-MM-DD
    section Week 1
    Research Topics      :a1, 2026-04-01, 2d
    Write Draft          :a2, after a1, 3d
    Add Images           :a3, after a2, 2d
    section Week 2
    Edit Content         :b1, 2026-04-08, 2d
    SEO Optimization     :b2, after b1, 1d
    Publish              :b3, after b2, 1d
    section Week 3
    Social Media Posts   :c1, 2026-04-15, 3d
    Engage Comments      :c2, after c1, 4d
    section Week 4
    Analytics Review     :d1, 2026-04-22, 2d
    Plan Next Month      :d2, after d1, 3d
```

### Project Timeline

```mermaid
gantt
    title Website Redesign Project
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    
    Design Phase       :des1, 2026-04-01, 7d
    Frontend Dev       :dev1, after des1, 10d
    Backend Dev        :dev2, after des1, 8d
    Testing            :test, after dev1 dev2, 5d
    Launch             :launch, after test, 2d
```

## Pie Charts

Pie charts show proportions.

### Content Distribution

```mermaid
pie title Blog Content by Category
    "Travel" : 25
    "Lifestyle" : 30
    "Creative" : 20
    "Growth" : 15
    "Tech" : 10
```

### Time Allocation

```mermaid
pie title Weekly Time Allocation
    "Writing" : 20
    "Photography" : 15
    "Editing" : 10
    "Social Media" : 8
    "Email" : 5
    "Learning" : 7
```

## Mind Maps

Mind maps organize ideas hierarchically.

### Content Strategy

```mermaid
mindmap
  root((Content Strategy))
    Planning
      Research
      Keywords
      Calendar
    Creation
      Writing
      Photography
      Video
    Distribution
      Blog
      Social Media
      Newsletter
    Engagement
      Comments
      Email Replies
      Social Interactions
```

### Blog Topics

```mermaid
mindmap
  root((Blog Topics))
    Travel
      Destinations
      Tips
      Gear
    Lifestyle
      Wellness
      Home
      Routines
    Creative
      Photography
      Design
      Tutorials
    Personal Growth
      Productivity
      Mindset
      Learning
```

## Timeline

Timelines show events in chronological order.

### My Blog Journey

```mermaid
timeline
    title My Blogging Journey
    2020 : Started Blog
           : First 10 Posts
    2021 : Reached 1K Readers
           : Added Photography
    2022 : Launched Newsletter
           : 10K Monthly Views
    2023 : Redesigned Site
           : Added Video Content
    2024 : Monetization
           : Sponsorship Deals
    2025 : Full-Time Blogging
           : Team of 3
    2026 : New Platform
           : Mobile App
```

## Combining Diagrams

You can use multiple diagrams in one article:

```mermaid
flowchart TD
    A[Start Article] --> B{Type?}
    B -->|Tutorial| C[Add Code Blocks]
    B -->|Story| D[Add Photos]
    B -->|Guide| E[Add Diagrams]
    C --> F[Publish]
    D --> F
    E --> F
```

---

## How to Use

1. **Choose the right diagram type** for your data
2. **Use code fences** with `mermaid` language
3. **Keep it simple** - don't overcrowd
4. **Test rendering** on mobile and desktop

## Tips

- **Flowcharts**: Best for processes and decisions
- **Sequence**: Show interactions over time
- **Class**: Display system architecture
- **Gantt**: Project timelines and schedules
- **Pie**: Show proportions and distributions
- **Mind Map**: Organize hierarchical ideas
- **Timeline**: Chronological events

---

**Try it yourself!** Copy any of these examples and modify them for your needs.

*What's your favorite diagram type? Let me know in the comments!*
