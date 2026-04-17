use regex::Regex;

#[allow(dead_code)]
pub trait Plugin {
    fn name(&self) -> &str;
    fn pre_process(&self, content: String) -> Option<String> {
        None
    }
    fn post_process(&self, content: String) -> Option<String> {
        None
    }
}

pub struct AdmonitionPlugin;

impl Plugin for AdmonitionPlugin {
    fn name(&self) -> &str {
        "Admonitions"
    }

    fn pre_process(&self, content: String) -> Option<String> {
        // Simple regex to convert :::type content ::: to <div> blocks
        // This is a basic implementation of the Admonition syntax
        let re =
            Regex::new(r"(?m)^:::(?P<type>\w+)\s*(?P<title>.*)\n(?P<body>[\s\S]*?)^:::").unwrap();

        let result = re.replace_all(&content, |caps: &regex::Captures| {
            let t = &caps["type"];
            let title = caps["title"].trim();
            let body = &caps["body"];

            let class = match t {
                "tip" => "admonition-tip",
                "warning" => "admonition-warning",
                "note" => "admonition-note",
                "danger" => "admonition-danger",
                _ => "admonition-default",
            };

            let title_html = if !title.is_empty() {
                format!("<div class=\"admonition-title\">{}</div>", title)
            } else {
                format!("<div class=\"admonition-title\">{}</div>", t)
            };

            format!(
                "<div class=\"{}\">\n{}\n{}\n</div>",
                class, title_html, body
            )
        });

        Some(result.into_owned())
    }
}

#[allow(dead_code)]
pub struct NoOpPlugin;
impl Plugin for NoOpPlugin {
    fn name(&self) -> &str {
        "NoOp"
    }
}

pub fn get_plugins() -> Vec<Box<dyn Plugin>> {
    vec![Box::new(AdmonitionPlugin), Box::new(NoOpPlugin)]
}
