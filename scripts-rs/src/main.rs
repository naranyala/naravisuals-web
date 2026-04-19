use clap::{Parser, Subcommand};
use scripts_rs::core::{Logger, Paths};
use scripts_rs::build_docs;
use std::process::Command;
use std::path::PathBuf;
use std::fs;

#[derive(Parser)]
#[command(name = "docts")]
#[command(about = "SSG Documentation Site Generator", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    #[arg(short, long, default_value_t = 3000)]
    port: u16,
}

#[derive(Subcommand)]
enum Commands {
    /// Start development server with hot reload
    Dev {
        #[arg(short, long)]
        port: Option<u16>,
    },
    /// Build for production
    Build {
        #[arg(long)]
        skip_clean: bool,
        #[arg(long)]
        skip_lint: bool,
        #[arg(long)]
        strict: bool,
    },
    /// Serve production build
    Start {
        #[arg(short, long)]
        port: Option<u16>,
    },
    /// Build + serve production locally
    Preview {
        #[arg(short, long)]
        port: Option<u16>,
    },
    /// Regenerate documentation only
    Docs {
        #[arg(long)]
        skip_validation: bool,
    },
    /// Check code quality
    Lint {
        #[arg(long)]
        fix: bool,
    },
    /// Run test suite
    Test {
        #[arg(long)]
        watch: bool,
        #[arg(long)]
        coverage: bool,
    },
    /// Clean build artifacts
    Clean,
    /// Show project information
    Info,
}

fn run_command(cmd: &str, args: &[&str], cwd: Option<PathBuf>) -> anyhow::Result<()> {
    let mut child = Command::new(cmd);
    child.args(args);
    if let Some(path) = cwd {
        child.current_dir(path);
    }
    let status = child.status()?;
    if status.success() {
        Ok(())
    } else {
        anyhow::bail!("Command failed with status {}", status)
    }
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    let logger = Logger::new();
    let paths = Paths::new();

    match cli.command {
        Commands::Dev { port } => {
            let port = port.unwrap_or(cli.port);
            logger.info(&format!("Starting development server on port {}...", port));
            
            logger.step("Building documentation...");
            build_docs::build_docs(&paths, &logger)?;
            logger.success("Documentation built");

            logger.step("Starting rspack dev server...");
            run_command("bunx", &["rspack", "serve", "--port", &port.to_string()], Some(paths.root))?;
        }
        Commands::Build { skip_clean, skip_lint, strict } => {
            logger.info("Building for production...");
            
            if !skip_clean {
                logger.step("Cleaning dist directory...");
                run_command("rm", &["-rf", "dist"], Some(paths.root.clone()))?;
                logger.success("Dist cleaned");
            }

            logger.step("Building documentation...");
            build_docs::build_docs(&paths, &logger)?;
            logger.success("Documentation built");

            if !skip_lint {
                logger.step("Running lint checks...");
                let res = run_command("bunx", &["biome", "check", "."], Some(paths.root.clone()));
                if let Err(e) = res {
                    if strict {
                        logger.error(&format!("Lint checks failed: {}", e));
                        std::process::exit(1);
                    }
                    logger.warn("Lint issues found, continuing build...");
                } else {
                    logger.success("Lint checks passed");
                }
            }

            logger.step("Running rspack production build...");
            run_command("bunx", &["rspack", "build"], Some(paths.root.clone()))?;
            logger.success("Production bundle created");

            logger.step("Copying third-party libraries...");
            let _ = run_command("bun", &["run", "scripts/copy-libs.mts"], Some(paths.root.clone()));
            
            logger.raw("\n BUILD COMPLETE");
        }
        Commands::Start { port } => {
            let port = port.unwrap_or(cli.port);
            logger.info(&format!("Serving production build on port {}...", port));
            run_command("npx", &["serve", "dist", "-p", &port.to_string(), "-s"], Some(paths.root))?;
        }
        Commands::Preview { port } => {
            let port = port.unwrap_or(cli.port);
            // Build first
            build_docs::build_docs(&paths, &logger)?;
            // Then start
            logger.info(&format!("Serving on port {}...", port));
            run_command("npx", &["serve", "dist", "-p", &port.to_string(), "-s"], Some(paths.root))?;
        }
        Commands::Docs { skip_validation } => {
            if !skip_validation {
                logger.info("Validating content...");
                // In the TS version, this runs 'bun run validate:strict'
                // We can implement it here or call the existing script.
                let _ = run_command("bun", &["run", "validate:strict"], Some(paths.root.clone()));
            }
            build_docs::build_docs(&paths, &logger)?;
            logger.success("Documentation regenerated");
        }
        Commands::Lint { fix } => {
        let args: Vec<&str> = if fix { 
            vec!["biome", "check", "--write", "."] 
        } else { 
            vec!["biome", "check", "."] 
        };
            run_command("bunx", &args, Some(paths.root))?;
        }
        Commands::Test { watch, coverage } => {
            let mut args = vec!["test"];
            if watch { args.push("--watch"); }
            if coverage { args.push("--coverage"); }
            run_command("bun", &args, Some(paths.root))?;
        }
        Commands::Clean => {
            run_command("rm", &["-rf", "dist", "coverage"], Some(paths.root))?;
            logger.success("Clean complete");
        }
        Commands::Info => {
            logger.info("Project Information");
            let pkg_path = paths.root.join("package.json");
            if let Ok(pkg_content) = fs::read_to_string(pkg_path) {
                let v: serde_json::Value = serde_json::from_str(&pkg_content)?;
                logger.raw(&format!("Name: {}", v["name"]));
                logger.raw(&format!("Version: {}", v["version"]));
            }

            // Count docs
            let docs_dir = paths.root.join("docs");
            if docs_dir.exists() {
                let count = walkdir::WalkDir::new(docs_dir)
                    .into_iter()
                    .filter_map(|e| e.ok())
                    .filter(|e| e.file_type().is_file() && e.file_name().to_string_lossy().ends_with(".md"))
                    .count();
                logger.raw(&format!("Documentation: {} files", count));
            }
        }
    }

// (rest of the file)
    Ok(())
}

