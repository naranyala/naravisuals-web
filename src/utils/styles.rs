pub const SIDEBAR_CSS: &str = r#"
.sidebar-wrapper {
    position: relative;
    height: 100%;
    width: var(--sidebar-width);
    transition: width 0.3s ease;
    z-index: 50;
    background-color: var(--sidebar-bg);
}

.sidebar {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
    border-right: 1px solid var(--border-color);
    min-height: 0;
}

.sidebar-header {
    padding: 1.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.sidebar-logo {
    text-decoration: none !important;
    color: var(--text-color) !important;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.025em;
    transition: opacity 0.2s;
}

.sidebar-logo:hover {
    opacity: 0.8;
}

.tools-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: 0.5rem;
}

.tools-btn:hover {
    background-color: var(--hover-bg);
    border-color: var(--primary-color);
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.75rem 2rem 0.75rem;
    min-height: 0;
}

.sidebar-group {
    margin-bottom: 1.5rem;
}

.sidebar-category {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 0 0 0.5rem 0.75rem;
    letter-spacing: 0.05em;
}

.sidebar-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0;
    margin: 0;
}

.sidebar-item {
    display: block !important;
    text-decoration: none !important;
    color: var(--text-color) !important;
    padding: 0.75rem 1rem !important;
    border-radius: 0.6rem !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    background-color: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--border-color) !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.sidebar-item:hover {
    background-color: var(--hover-bg) !important;
    color: var(--text-color) !important;
    border-color: var(--primary-color) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 12px -3px rgba(0, 0, 0, 0.2) !important;
}

.sidebar-item.active {
    background-color: var(--hover-bg) !important;
    color: var(--text-color) !important;
    font-weight: 600 !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3) !important;
    transform: translateY(-1px) !important;
}

.close-sidebar {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.25rem;
    cursor: pointer;
    display: none;
    padding: 0.25rem;
}

.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 900;
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.sidebar-overlay.open {
    display: block;
    opacity: 1;
    pointer-events: auto;
}

@media (max-width: 768px) {
    .sidebar-overlay {
        display: block;
        opacity: 0;
        pointer-events: none;
    }
    
    .sidebar-overlay.open {
        opacity: 1;
        pointer-events: auto;
    }
}

.search-sidebar {
    width: 0;
    height: 100%;
    background-color: var(--sidebar-bg);
    border-left: 0 solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    overflow: hidden;
}

.search-sidebar.open {
    width: 350px;
    border-left: 1px solid var(--border-color);
}

.search-sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    gap: 1rem;
    align-items: center;
}

.search-sidebar-input {
    flex: 1;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0 10px;
    color: var(--text-color);
    font-size: 14px;
    outline: none;
    height: 32px;
    line-height: 32px;
}

.search-sidebar-input:focus {
    border-color: var(--primary-color);
}

.search-sidebar-close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.5rem;
    cursor: pointer;
}

.search-sidebar-results {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.search-result-item {
    display: block;
    text-decoration: none !important;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid transparent;
    transition: all 0.2s ease;
}

.search-result-item:hover {
    background-color: var(--hover-bg);
    border-color: var(--border-color);
}

.search-result-title {
    display: block;
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
}

.search-result-heading {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.search-result-snippet {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
    line-height: 1.4;
}

.search-result-snippet mark, .search-result-title mark, .search-result-heading mark {
    background-color: rgba(96, 165, 250, 0.3);
    color: var(--text-color);
    padding: 0 0.15rem;
    border-radius: 0.125rem;
}

.search-result-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;
}

.search-result-item-heading {
    display: block;
    text-decoration: none !important;
    padding: 0.5rem 1rem 0.5rem 1.5rem;
    border-radius: 0.5rem;
    margin-top: 0.25rem;
    border-left: 2px solid var(--border-color);
    transition: all 0.2s ease;
    font-size: 0.85rem;
}

.search-result-item-heading:hover {
    background-color: var(--hover-bg);
    border-left-color: var(--primary-color);
}

.tools-sidebar {
    width: 0;
    height: 100%;
    background-color: var(--sidebar-bg);
    border-left: 0 solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    overflow: hidden;
}

.tools-sidebar.open {
    width: 300px;
    border-left: 1px solid var(--border-color);
}

.tools-sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tools-sidebar-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
}

.tools-tab-nav {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    padding: 0 1rem;
}

.tab-btn {
    flex: 1;
    padding: 0.75rem;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
}

.tab-btn:hover {
    color: var(--text-color);
}

.tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}

.search-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0.75rem;
}

.back-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    width: 100%;
    text-align: left;
}

.back-btn:hover {
    background-color: var(--hover-bg);
    border-color: var(--primary-color);
}

.search-sidebar-input {
    width: 100%;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0 10px;
    color: var(--text-color);
    font-size: 14px;
    outline: none;
    margin-bottom: 8px;
    height: 32px;
    line-height: 32px;
}

.search-sidebar-input:focus {
    border-color: var(--primary-color);
}

.search-sidebar-input::placeholder {
    color: var(--text-muted);
}

.search-results-list {
    flex: 1;
    overflow-y: auto;
}

.tools-sidebar-close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.25rem;
    cursor: pointer;
}

.tools-sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.tool-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    background-color: var(--bg-color);
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
}

.tool-item:hover {
    border-color: var(--primary-color);
    background-color: var(--hover-bg);
}

.tool-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.tool-name {
    font-size: 0.8rem;
    color: var(--text-color);
    text-align: center;
}

@media (max-width: 768px) {
    .sidebar-wrapper {
        position: fixed;
        top: 50px;
        left: 0;
        width: 280px !important;
        height: calc(100vh - 50px);
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .sidebar-wrapper.open {
        transform: translateX(0);
    }

    .sidebar {
        width: 100%;
        height: 100%;
    }

    .close-sidebar {
        display: block;
    }
}
"#;