use md_compiler::parser::ast::Node;
use serde_json;

pub struct DocEntry {
    pub path: &'static str,
    pub title: &'static str,
}

pub const DOCS: &[DocEntry] = &[
    DocEntry { path: "00-introduction/00-overview", title: "Overview of Tauri and Leptos" },
    DocEntry { path: "00-introduction/01-why-this-stack", title: "Why Choose This Stack?" },
    DocEntry { path: "00-introduction/02-architecture", title: "Architecture Overview" },
    DocEntry { path: "01-leptos-frontend/00-getting-started", title: "Getting Started with Leptos in Tauri" },
    DocEntry { path: "01-leptos-frontend/01-reactive-state", title: "Reactive State in Leptos" },
    DocEntry { path: "01-leptos-frontend/02-component-structure", title: "Component Structure" },
    DocEntry { path: "02-tauri-backend/00-backend-overview", title: "The Tauri Backend Overview" },
    DocEntry { path: "02-tauri-backend/01-tauri-commands", title: "Tauri Commands" },
    DocEntry { path: "02-tauri-backend/02-state-management", title: "Backend State Management" },
    DocEntry { path: "02-tauri-backend/03-security-and-permissions", title: "Security and Permissions" },
    DocEntry { path: "03-bridge-communication/00-ipc-basics", title: "IPC Basics: The Bridge" },
    DocEntry { path: "03-bridge-communication/01-invoking-commands", title: "Invoking Commands from Leptos" },
    DocEntry { path: "03-bridge-communication/02-event-system", title: "The Event System" },
    DocEntry { path: "03-bridge-communication/03-type-safe-sharing", title: "Type-Safe Sharing" },
    DocEntry { path: "04-desktop-integration/00-os-api-overview", title: "OS API Overview" },
    DocEntry { path: "04-desktop-integration/01-filesystem-access", title: "Filesystem Access" },
    DocEntry { path: "04-desktop-integration/02-system-tray-menus", title: "System Tray and Menus" },
    DocEntry { path: "04-desktop-integration/03-window-management", title: "Window Management" },
    DocEntry { path: "04-desktop-integration/04-notifications", title: "Native Notifications" },
    DocEntry { path: "05-build-and-distribute/00-build-process", title: "The Build Process" },
    DocEntry { path: "05-build-and-distribute/01-target-platforms", title: "Target Platforms" },
    DocEntry { path: "05-build-and-distribute/02-optimization-tips", title: "Optimization Tips" },
    DocEntry { path: "test_headings", title: "Heading 1" },
];

pub fn get_ast(path: &str) -> Option<Node> {
    let json = match path {
        "00-introduction/00-overview" => include_str!("../generated/json/00-introduction/00-overview.json"),
        "00-introduction/01-why-this-stack" => include_str!("../generated/json/00-introduction/01-why-this-stack.json"),
        "00-introduction/02-architecture" => include_str!("../generated/json/00-introduction/02-architecture.json"),
        "01-leptos-frontend/00-getting-started" => include_str!("../generated/json/01-leptos-frontend/00-getting-started.json"),
        "01-leptos-frontend/01-reactive-state" => include_str!("../generated/json/01-leptos-frontend/01-reactive-state.json"),
        "01-leptos-frontend/02-component-structure" => include_str!("../generated/json/01-leptos-frontend/02-component-structure.json"),
        "02-tauri-backend/00-backend-overview" => include_str!("../generated/json/02-tauri-backend/00-backend-overview.json"),
        "02-tauri-backend/01-tauri-commands" => include_str!("../generated/json/02-tauri-backend/01-tauri-commands.json"),
        "02-tauri-backend/02-state-management" => include_str!("../generated/json/02-tauri-backend/02-state-management.json"),
        "02-tauri-backend/03-security-and-permissions" => include_str!("../generated/json/02-tauri-backend/03-security-and-permissions.json"),
        "03-bridge-communication/00-ipc-basics" => include_str!("../generated/json/03-bridge-communication/00-ipc-basics.json"),
        "03-bridge-communication/01-invoking-commands" => include_str!("../generated/json/03-bridge-communication/01-invoking-commands.json"),
        "03-bridge-communication/02-event-system" => include_str!("../generated/json/03-bridge-communication/02-event-system.json"),
        "03-bridge-communication/03-type-safe-sharing" => include_str!("../generated/json/03-bridge-communication/03-type-safe-sharing.json"),
        "04-desktop-integration/00-os-api-overview" => include_str!("../generated/json/04-desktop-integration/00-os-api-overview.json"),
        "04-desktop-integration/01-filesystem-access" => include_str!("../generated/json/04-desktop-integration/01-filesystem-access.json"),
        "04-desktop-integration/02-system-tray-menus" => include_str!("../generated/json/04-desktop-integration/02-system-tray-menus.json"),
        "04-desktop-integration/03-window-management" => include_str!("../generated/json/04-desktop-integration/03-window-management.json"),
        "04-desktop-integration/04-notifications" => include_str!("../generated/json/04-desktop-integration/04-notifications.json"),
        "05-build-and-distribute/00-build-process" => include_str!("../generated/json/05-build-and-distribute/00-build-process.json"),
        "05-build-and-distribute/01-target-platforms" => include_str!("../generated/json/05-build-and-distribute/01-target-platforms.json"),
        "05-build-and-distribute/02-optimization-tips" => include_str!("../generated/json/05-build-and-distribute/02-optimization-tips.json"),
        "test_headings" => include_str!("../generated/json/test_headings.json"),
        _ => return None,
    };
    serde_json::from_str(json).ok()
}
