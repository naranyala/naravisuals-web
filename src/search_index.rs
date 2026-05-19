pub struct SearchEntry {
    pub path: &'static str,
    pub content: &'static str,
}

pub const SEARCH_INDEX: &[SearchEntry] = &[
    SearchEntry { path: "00-introduction/00-overview", content: "Overview of Tauri and LeptosBuilding modern desktop applications typically requires a choice between native performance and web-based flexibility. By combining Tauri, Leptos, and Rust, you get the best of both worlds: a high-performance Rust backend and a reactive, type-safe frontend.This guide will take you through the process of building a production-ready desktop app using this powerful combination." },
    SearchEntry { path: "00-introduction/01-why-this-stack", content: "Why Choose This Stack?When building desktop applications, developers often face a tradeoff between development speed (Web technologies) and system performance (Native technologies). The combination of Tauri, Leptos, and Rust eliminates this tradeoff.The Problems with Traditional FrameworksElectron: While powerful, Electron bundles a full Chromium browser and Node.js runtime, leading to massive binary sizes (often 100MB+) and high RAM consumption.Pure Native (C++/Qt): Offers extreme performance but often comes with a steeper learning curve, slower development cycles, and more complex UI design processes.The Solution: Tauri + Leptos + RustTauri: Instead of bundling a browser, Tauri uses the system's native webview (WebView2 on Windows, WebKit on macOS/Linux). This results in binaries that are often under 10MB.Leptos: By using Rust on the frontend via WebAssembly, you get compile-time type safety and fine-grained reactivity, meaning the UI only updates the exact DOM nodes that change.Rust: You use one language for everything. The same types and logic can often be shared between the frontend and backend." },
    SearchEntry { path: "00-introduction/02-architecture", content: "Architecture OverviewUnderstanding how a Tauri + Leptos application is structured is key to building scalable software. The app is split into two primary environments: the Core Process and the WebView Process.The Core Process (Rust)The Core process is a native Rust application. It has full access to the operating system and is responsible for:Window management and lifecycle.Accessing the filesystem, network, and system APIs.Managing global application state.Handling security and permissions.The WebView Process (Leptos/WASM)The WebView process is where your user interface lives. In this stack, it is a Leptos application compiled to WebAssembly (WASM). It is responsible for:Rendering the HTML/CSS.Handling user interactions.Managing local UI state.The Bridge (IPC)Because the Core and WebView processes are isolated for security reasons, they communicate via Inter-Process Communication (IPC). This bridge allows the frontend to \"invoke\" Rust functions and the backend to \"emit\" events to the UI." },
    SearchEntry { path: "01-leptos-frontend/00-getting-started", content: "Getting Started with Leptos in TauriLeptos is a full-stack Rust framework that is uniquely suited for Tauri because it can be compiled to WebAssembly (WASM), allowing you to write your frontend logic in Rust.Installation and SetupTo use Leptos in a Tauri project, you typically set up a CSR (Client-Side Rendering) project. This ensures that the Tauri webview can load the WASM binary and render the UI without needing a separate server.The WASM PipelineYour Rust code in the frontend is compiled using wasm-pack or trunk. Trunk is the most common tool for this, as it handles the HTML entry point, CSS bundling, and WASM compilation in one step.Project StructureA typical Tauri + Leptos project looks like this:src-tauri/: The Rust backend (Tauri Core).src/: The Rust frontend (Leptos components).index.html: The entry point for the webview." },
    SearchEntry { path: "01-leptos-frontend/01-reactive-state", content: "Reactive State in LeptosAt the heart of Leptos is its fine-grained reactivity system. Unlike frameworks that re-render entire components (like React), Leptos only updates the specific parts of the DOM that depend on a piece of state.SignalsSignals are the primary way to manage state. A signal consists of a getter and a setter.let (count, set_count) = create_signal(0);count(): Returns the current value.set_count.set(val): Updates the value.set_count.update(|n| *n += 1): Updates the value using a closure.Derived Signals (Memos)Memos are signals that depend on other signals. They are cached and only re-calculate when their dependencies change.let double_count = create_memo(move |_| count() * 2);EffectsEffects allow you to run side-effecting code (like logging or calling a JS API) whenever a signal changes.create_effect(move |_| {
    logging::log!(\"Count is now: {}\", count());
});" },
    SearchEntry { path: "01-leptos-frontend/02-component-structure", content: "Component StructureComponents in Leptos are the building blocks of your UI. They are defined using the #[component] macro, which allows you to pass properties as function arguments.The view! MacroThe view! macro is where you define your HTML structure. It looks like HTML but is actually Rust code that generates highly efficient DOM operations.#[component]
fn Welcome(name: String) -> impl IntoView {
    view! {
        <div>
            <h1>\"Welcome, \" {name} \"!\"</h1>
            <p>\"Enjoy your Tauri app.\"</p>
        </div>
    }
}Dynamic ListsTo render lists, Leptos provides the <For /> component, which efficiently manages lists of items by tracking them via a key.view! {
    <ul>
        <For
            each=move || items()
            key=|item| item.id
            children=|item| view! { <li>{item.name}</li> }
        />
    </ul>
}Conditional RenderingYou can use the <Show /> component or simple Rust match expressions inside the view! macro to conditionally display elements." },
    SearchEntry { path: "02-tauri-backend/00-backend-overview", content: "The Tauri Backend OverviewThe Tauri backend is where the \"heavy lifting\" of your application happens. Unlike the frontend, which is restricted by the browser's sandbox, the backend is a native Rust process with full access to the operating system.Role of the BackendThe backend serves several critical purposes:OS Interop: Talking to the filesystem, network, and hardware.Performance: Running computationally expensive tasks that would freeze the UI.Security: Managing sensitive data and API keys that should never be exposed to the frontend.Lifecycle: Controlling when the app starts, minimizes, or closes.The Rust EcosystemBecause the backend is standard Rust, you can use any crate from crates.io. Whether you need a database like sqlx, a networking library like reqwest, or a serialization tool like serde, you have the full power of the Rust ecosystem at your disposal." },
    SearchEntry { path: "02-tauri-backend/01-tauri-commands", content: "Tauri CommandsCommands are the primary way for your Leptos frontend to trigger logic in the Rust backend. They work similarly to an API endpoint in a web server.Defining a CommandA command is simply a Rust function annotated with #[tauri::command].#[tauri::command]
fn calculate_stats(data: Vec<f64>) -> f64 {
    let sum: f64 = data.iter().sum();
    sum / data.len() as f64
}Registering CommandsFor a command to be reachable from the frontend, it must be registered in the invoke_handler during the app builder phase:fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![calculate_stats])
        .run(tauri::generate_context!())
        .expect(\"error while running tauri application\");
}Async CommandsIf a command needs to perform I/O (like reading a file or calling an API), it should be async. Tauri automatically handles the async execution so that the main thread is not blocked.#[tauri::command]
async fn fetch_remote_data(url: String) -> Result<String, String> {
    reqwest::get(url).await
        .map_err(|e| e.to_string())?
        .text().await
        .map_err(|e| e.to_string())
}" },
    SearchEntry { path: "02-tauri-backend/02-state-management", content: "Backend State ManagementOften, your application needs to maintain state that persists across multiple command calls—such as a database connection pool or a user session.The .manage() MethodTauri provides a built-in state management system. You can inject any Rust type into the Tauri context using the .manage() method.struct AppConfig {
    api_key: String,
}

fn main() {
    tauri::Builder::default()
        .manage(AppConfig { api_key: \"secret_123\".into() })
        // ...
}Accessing State in CommandsTo use the managed state inside a command, use the tauri::State extractor in the function arguments.#[tauri::command]
fn get_config(state: tauri::State<'_, AppConfig>) -> String {
    state.api_key.clone()
}Mutable StateSince state is shared across multiple threads (commands), you cannot mutate it directly. You must use thread-safe wrappers like Mutex or RwLock.struct AppCounter(Mutex<i32>);

#[tauri::command]
fn increment(state: tauri::State<'_, AppCounter>) {
    let mut count = state.0.lock().unwrap();
    *count += 1;
}" },
    SearchEntry { path: "02-tauri-backend/03-security-and-permissions", content: "Security and PermissionsTauri is designed with a \"security-first\" mindset. Because the backend has full OS access, Tauri implements a strict permission system to prevent the frontend from doing things it shouldn't.The Sandbox ModelThe frontend (WebView) is sandboxed. It cannot access the filesystem or network directly using native Rust APIs; it can only do so by calling Tauri commands that you have explicitly written and exposed.The Capability SystemIn modern Tauri versions, you define Capabilities. These are JSON files that specify exactly which commands and plugins the frontend is allowed to use.For example, if you use the fs plugin, you can restrict the frontend to only read from the $APPCONFIG folder, preventing it from reading the user's entire home directory.Avoiding \"Dangerous\" CommandsA common security pitfall is creating a \"generic\" command that takes a path as an argument and reads it:// DANGEROUS: Frontend can pass any path on the system!
#[tauri::command]
fn read_file(path: String) -> String {
    std::fs::read_to_string(path).unwrap()
}The Secure Way: Validate paths on the backend or use pre-defined allowed directories." },
    SearchEntry { path: "03-bridge-communication/00-ipc-basics", content: "IPC Basics: The BridgeInter-Process Communication (IPC) is the mechanism that allows the Leptos frontend and the Tauri Rust backend to talk to each other.Why IPC is NecessaryThe frontend runs in a Webview (a browser-like environment), and the backend runs as a native OS process. They live in different memory spaces. To communicate, they must serialize data into JSON, send it across a bridge, and deserialize it on the other side.The Two Communication PatternsThere are two primary ways to communicate:Invoke (Request-Response): The frontend asks the backend to do something and waits for a result.Example: \"Please calculate the sum of these numbers and tell me the answer.\"Emit (Event-Driven): The backend (or frontend) sends a message without expecting an immediate reply.Example: \"The download is 50% complete.\"Serialization with SerdeBecause data is sent as JSON, every type sent across the bridge must implement serde::Serialize and serde::Deserialize. This ensures that the Rust types in the backend match the objects expected by the frontend." },
    SearchEntry { path: "03-bridge-communication/01-invoking-commands", content: "Invoking Commands from LeptosInvoking a command is the most common way to trigger backend logic.Using the JavaScript BridgeTauri provides a JS API to call Rust functions. In a Leptos app, you can call these via wasm-bindgen or by using a small JS helper.import { invoke } from '@tauri-apps/api/core';

async function callGreet() {
  const response = await invoke('greet', { name: 'Leptos User' });
  console.log(response);
}Integrating with Leptos ActionsIn Leptos, you should wrap these calls in create_action. This allows you to track the loading state and handle the result reactively.let greet_action = create_action(|name: &String| {
    // Call JS bridge to invoke 'greet'
});

// In view:
view! {
    <button on:click=move |_| greet_action.dispatch(\"World\".to_string())>
        \"Greet\"
    </button>
    {move || greet_action.value().map(|res| view! { <p>{res}</p> })}
}Error HandlingCommands can return a Result<T, E>. If the Rust function returns an Err, the JS promise will reject, allowing you to catch the error in your frontend UI." },
    SearchEntry { path: "03-bridge-communication/02-event-system", content: "The Event SystemEvents are used for asynchronous, one-way communication. They are perfect for long-running tasks or system notifications.Emitting Events from RustThe backend can emit an event to all windows or a specific window.use tauri::Emitter;

#[tauri::command]
fn start_process(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        for i in 1..=100 {
            app.emit(\"progress\", i).unwrap();
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
    });
}Listening for Events in LeptosTo react to these events in the UI, you set up a listener. In Leptos, you typically do this inside a create_effect.create_effect(move |_| {
    // Use JS bridge to listen for \"progress\"
    // When received, update a Leptos signal:
    // set_progress.set(new_value);
});Use Cases for EventsProgress Bars: Updating a percentage during a large file upload.Hardware Status: Notifying the UI when a USB device is plugged in.Global State Sync: Updating multiple windows simultaneously when a setting changes." },
    SearchEntry { path: "03-bridge-communication/03-type-safe-sharing", content: "Type-Safe SharingOne of the biggest advantages of using Rust for both the frontend and backend is the ability to share types.The Shared Crate PatternInstead of defining the same User struct in both the src-tauri and src folders, create a separate crate (e.g., my-app-types) that both depend on.// in shared_types/src/lib.rs
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub id: u64,
    pub username: String,
    pub email: String,
}Benefits of Shared TypesSingle Source of Truth: If you add a field to UserProfile, both the backend and frontend will be updated.Compile-Time Checking: If the backend changes a field from a String to an Option<String>, the frontend code will fail to compile until you handle the None case.Reduced Boilerplate: No more manual JSON parsing or guessing the shape of the data coming across the bridge.Implementation TipMake sure your shared crate uses serde and is compatible with wasm32-unknown-unknown so it can be compiled into the Leptos frontend." },
    SearchEntry { path: "04-desktop-integration/00-os-api-overview", content: "OS API OverviewTauri provides a set of plugins and APIs that allow your application to behave like a first-class citizen on the user's operating system.Beyond the BrowserA standard web app is trapped in a sandbox. It cannot know the computer's name, cannot access files outside the browser's \"upload\" dialog, and cannot create system-level shortcuts. Tauri breaks these barriers.The Plugin ArchitectureTauri's functionality is modular. Instead of including everything in the core, features are split into plugins:tauri-plugin-fs: Filesystem access.tauri-plugin-shell: Opening URLs or executing external commands.tauri-plugin-http: Making native HTTP requests (bypassing CORS).tauri-plugin-dialog: Native save/open file dialogs.Choosing Between Rust and JS APIsMost Tauri plugins provide both a Rust API (for the backend) and a JS API (for the frontend).Use the Rust API for secure, heavy-duty operations.Use the JS API for simple UI-driven tasks (like opening a folder picker)." },
    SearchEntry { path: "04-desktop-integration/01-filesystem-access", content: "Filesystem AccessHandling files is a core requirement for many desktop apps. Tauri provides a safe way to interact with the user's disk.Scoped AccessFor security, Tauri uses \"scopes\". You can define which directories the app is allowed to access in your configuration. Common scopes include:$APPCONFIG: The application's configuration directory.$APPDATA: The application's data directory.$HOME: The user's home folder.Reading and Writing FilesYou can perform file operations using the fs plugin.Example (Rust Backend):use tauri_plugin_fs::FsExt;

#[tauri::command]
fn save_settings(app: tauri::AppHandle, data: String) {
    let path = app.path().app_config_dir().unwrap().join(\"settings.json\");
    std::fs::write(path, data).expect(\"Failed to write\");
}Native File DialogsInstead of making the user type a path, use the dialog plugin to show a native \"Open File\" or \"Save As\" window. This is the best practice for user experience and security." },
    SearchEntry { path: "04-desktop-integration/02-system-tray-menus", content: "System Tray and MenusThe system tray (or menu bar on macOS) allows your app to stay active in the background and provides quick access to common actions.Creating a Tray IconThe tray is configured in the main function of your Rust backend.use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, \"quit\", \"Quit\", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;
            
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .build(app)?;
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect(\"error while running tauri application\");
}Handling Tray EventsYou can listen for clicks on the tray icon or specific menu items to trigger actions, such as showing the main window or performing a \"Quick Action\" without opening the UI.Global ShortcutsTauri also allows you to register global shortcuts (e.g., Ctrl+Shift+P) that trigger Rust functions even when your app window is not focused." },
    SearchEntry { path: "04-desktop-integration/03-window-management", content: "Window ManagementTauri gives you granular control over how your application windows look and behave.Customizing the WindowYou can configure the window's appearance in tauri.conf.json or programmatically in Rust.Transparency: Set transparent: true to create non-rectangular windows or glass effects.Frameless: Set decorations: false to remove the standard OS title bar and borders, allowing you to build a custom, branded header.Always on Top: Keep your app visible above all other windows (useful for toolbars or overlays).Multi-Window ApplicationsTauri supports creating multiple windows. This is useful for:A main dashboard and a separate \"Settings\" window.Tool palettes that can be dragged to a second monitor.Splash screens that disappear once the app has finished loading.let window = tauri::WindowBuilder::new(
    app, 
    \"settings\", 
    tauri::WindowUrl::App(\"settings.html\".into())
).build()?;Window CommunicationWindows can communicate with each other by emitting events. One window can tell another window to refresh its data or close itself." },
    SearchEntry { path: "04-desktop-integration/04-notifications", content: "Native NotificationsNotifications are the primary way to communicate with the user when the application is minimized or running in the background.Sending NotificationsYou can send a notification from the Rust backend using the notification plugin.use tauri_plugin_notification::NotificationExt;

#[tauri::command]
fn send_alert(app: tauri::AppHandle) {
    app.notification()
        .builder()
        .title(\"Update Complete\")
        .body(\"Your files have been successfully synchronized.\")
        .show()
        .unwrap();
}Customizing NotificationsDepending on the OS, you can add:Icons: A small image next to the text.Actions: Buttons within the notification (e.g., \"Undo\" or \"Open\").Urgency: Marking the notification as critical to bypass \"Do Not Disturb\" modes (where permitted).Best PracticesAvoid \"notification spam\". Users find frequent popups annoying. Instead, use notifications for critical events and use a \"Notification Center\" inside your app for less urgent updates." },
    SearchEntry { path: "05-build-and-distribute/00-build-process", content: "The Build ProcessTurning your code into a distributable application involves several steps of compilation and bundling.How Tauri Builds Your AppWhen you run cargo tauri build, the following happens:Frontend Compilation: Tauri runs your frontend build script (e.g., trunk build --release). This compiles your Leptos Rust code into an optimized WASM binary and generates the HTML/CSS/JS.Backend Compilation: Cargo compiles the native Rust core with the --release flag, applying heavy optimizations for speed and size.Asset Bundling: The WASM and assets are embedded directly into the final native binary.Installer Generation: Tauri uses system tools (like WiX on Windows or hdiutil on macOS) to wrap the binary in a standard installer (.msi, .dmg, .deb).Build TimesThe first build is usually slow because it compiles all dependencies. Subsequent builds are much faster due to Cargo's caching. Use a fast SSD and ensure you have enough RAM to speed up the process." },
    SearchEntry { path: "05-build-and-distribute/01-target-platforms", content: "Target PlatformsTauri allows you to target all major desktop operating systems from a single codebase.WindowsTauri uses WebView2 (based on Edge/Chromium).Installer: Generates .msi and .exe.Requirements: Users must have the WebView2 runtime installed (which is pre-installed on Windows 10/11).macOSTauri uses WebKit (the engine behind Safari).Installer: Generates .app and .dmg.Requirements: Standard macOS environment. Note that for distribution, you will need an Apple Developer account to \"sign\" and \"notarize\" your app, otherwise users will see a security warning.LinuxTauri uses WebKitGTK.Installer: Generates .deb and AppImage.Requirements: The user must have the necessary WebKitGTK libraries installed on their system.Cross-CompilationCross-compiling (e.g., building a Windows .exe from a Mac) is complex in Rust. The recommended approach is to use GitHub Actions or other CI/CD pipelines to build the app on native runners for each platform." },
    SearchEntry { path: "05-build-and-distribute/02-optimization-tips", content: "Optimization TipsTo make your application as professional and lightweight as possible, you should apply several optimization techniques.Frontend Optimization (WASM)WASM binaries can be large. Use wasm-opt (provided by the binaryen package) to shrink the size of your Leptos frontend. This can often reduce the binary size by 20-50%.Backend Optimization (Rust)In your Cargo.toml, you can enable Link Time Optimization (LTO) and set the panic strategy to abort to reduce the binary size further:[profile.release]
lto = true
codegen-units = 1
panic = 'abort'
strip = trueLTO: Allows the compiler to optimize across crate boundaries.Strip: Removes debug symbols from the final binary, significantly reducing size.Resource ManagementLazy Loading: For very large apps, consider loading certain components only when needed.Asset Compression: Compress images and SVGs before embedding them in the app.Memory Profiling: Use tools like heaptrack or Valgrind on the backend to ensure there are no memory leaks in your Rust code." },
    SearchEntry { path: "test_headings", content: "Heading 1Heading 2Heading 3Heading 4Heading 5Heading 6Indented HeadingIndented Heading 2Heading with Bold and Italic" },
];
