use leptos::*;

#[derive(Copy, Clone)]
pub struct AppState {
    pub theme: ThemeState,
    pub search: SearchState,
    pub sidebar: SidebarState,
    pub tools: ToolsState,
}

#[derive(Copy, Clone)]
pub struct ThemeState {
    pub is_light: ReadSignal<bool>,
    pub set_is_light: WriteSignal<bool>,
}

#[derive(Copy, Clone)]
pub struct SearchState {
    pub is_open: ReadSignal<bool>,
    pub set_is_open: WriteSignal<bool>,
}

#[derive(Copy, Clone)]
pub struct SidebarState {
    pub width: ReadSignal<String>,
    pub set_width: WriteSignal<String>,
    pub is_open: ReadSignal<bool>,
    pub set_is_open: WriteSignal<bool>,
}

#[derive(Copy, Clone)]
pub struct ToolsState {
    pub is_open: ReadSignal<bool>,
    pub set_is_open: WriteSignal<bool>,
}

impl AppState {
    pub fn new() -> Self {
        let (is_light, set_is_light) = create_signal(false);
        let (is_search_open, set_is_search_open) = create_signal(false);
        let (sidebar_width, set_sidebar_width) = create_signal("25%".to_string());
        let (is_sidebar_open, set_is_sidebar_open) = create_signal(false);
        let (is_tools_open, set_is_tools_open) = create_signal(false);

        Self {
            theme: ThemeState {
                is_light,
                set_is_light,
            },
            search: SearchState {
                is_open: is_search_open,
                set_is_open: set_is_search_open,
            },
            sidebar: SidebarState {
                width: sidebar_width,
                set_width: set_sidebar_width,
                is_open: is_sidebar_open,
                set_is_open: set_is_sidebar_open,
            },
            tools: ToolsState {
                is_open: is_tools_open,
                set_is_open: set_is_tools_open,
            },
        }
    }

    #[allow(dead_code)]
    pub fn provide() {
        provide_context(Self::new());
    }

    pub fn use_state() -> Self {
        use_context::<Self>().expect("AppState not provided")
    }
}
