use colored::*;
use std::path::PathBuf;
use std::env;

#[allow(dead_code)]
pub struct Colors;
#[allow(dead_code)]
impl Colors {
    pub fn cyan() -> String { " ".color(colored::Color::Cyan).to_string() }
    pub fn reset() -> String { "".normal().to_string() }
    pub fn green() -> String { " ".color(colored::Color::Green).to_string() }
    pub fn yellow() -> String { " ".color(colored::Color::Yellow).to_string() }
    pub fn red() -> String { " ".color(colored::Color::Red).to_string() }
    pub fn blue() -> String { " ".color(colored::Color::Blue).to_string() }
    pub fn bright() -> String { " ".bold().to_string() }
    pub fn dim() -> String { " ".dimmed().to_string() }
    pub fn bg_green() -> String { " ".on_color(colored::Color::Green).to_string() }
}

pub struct Logger;

impl Default for Logger {
    fn default() -> Self {
        Self::new()
    }
}

impl Logger {
    pub fn new() -> Self { Self }

    pub fn info(&self, msg: &str) {
        println!("{} {}", "ℹ".blue(), msg);
    }

    pub fn warn(&self, msg: &str) {
        println!("{} {}", "⚠".yellow(), msg);
    }

    pub fn error(&self, msg: &str) {
        println!("{} {}", "✗".red(), msg);
    }

    pub fn success(&self, msg: &str) {
        println!("{} {}", "✓".green(), msg);
    }

    pub fn step(&self, msg: &str) {
        println!("{} {}", "➜".cyan(), msg);
    }

    pub fn raw(&self, msg: &str) {
        println!("{}", msg);
    }

    #[allow(dead_code)]
    pub fn blank(&self) {
        println!();
    }
}

pub struct Paths {
    pub root: PathBuf,
}

impl Default for Paths {
    fn default() -> Self {
        Self::new()
    }
}

impl Paths {
    pub fn new() -> Self {
        // In a real scenario, we might search for a marker file
        // For now, assume current directory is root or go up until we find package.json
        let mut current = env::current_dir().expect("Failed to get current dir");
        while current.exists() && !current.join("package.json").exists() {
            if let Some(parent) = current.parent() {
                current = parent.to_path_buf();
            } else {
                break;
            }
        }
        Self { root: current }
    }

    pub fn with_root(root: PathBuf) -> Self {
        Self { root }
    }
}
