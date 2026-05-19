#[cfg(test)]
mod tests {
    use md_compiler::utils::*;

    #[test]
    fn test_path_to_component_name() {
        assert_eq!(path_to_component_name("00-introduction/00-overview"), "Doc00Introduction00Overview");
        assert_eq!(path_to_component_name("01-leptos-frontend/01-reactive-state"), "Doc01LeptosFrontend01ReactiveState");
        // Edge case: Paths with extra hyphens or unusual names
        assert_eq!(path_to_component_name("00-my-long-file-name"), "Doc00MyLongFileName");
        assert_eq!(path_to_component_name("deeply/nested/dir/01-page"), "DocDeeplyNestedDir01Page");
    }

    #[test]
    fn test_path_to_module_name() {
        assert_eq!(path_to_module_name("00-introduction/00-overview"), "doc_00_introduction_00_overview");
        assert_eq!(path_to_module_name("01-leptos-frontend/01-reactive-state"), "doc_01_leptos_frontend_01_reactive_state");
        // Edge case: Complex paths
        assert_eq!(path_to_module_name("deeply/nested/dir/01-page"), "doc_deeply_nested_dir_01_page");
    }

    #[test]
    fn test_has_valid_prefix() {
        assert!(has_valid_prefix("01-test"));
        assert!(has_valid_prefix("123-test"));
        assert!(!has_valid_prefix("test-01"));
        assert!(!has_valid_prefix("abc"));
        assert!(!has_valid_prefix("-test")); // Starts with hyphen
        assert!(!has_valid_prefix(""));      // Empty
    }
}
