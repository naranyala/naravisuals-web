pub struct DocEntry { pub path: &'static str, pub title: &'static str, pub content: &'static str }

pub const DOCS: &[DocEntry] = &[
    DocEntry { path: "advanced", title: "Advanced Features", content: include_str!("../docs/advanced.md") },
    DocEntry { path: "getting-started", title: "Getting Started", content: include_str!("../docs/getting-started.md") },
    DocEntry { path: "home", title: "Welcome to Rigorstarter", content: include_str!("../docs/home.md") },
    DocEntry { path: "more-in-development", title: "more-in-development", content: include_str!("../docs/more-in-development.md") },
    DocEntry { path: "sample-data", title: "my data", content: include_str!("../docs/sample-data.md") },
];
