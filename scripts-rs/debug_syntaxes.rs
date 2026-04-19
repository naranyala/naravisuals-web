use syntect::parsing::SyntaxSet;

fn main() {
    let ss = SyntaxSet::load_defaults_newlines();
    for syntax in ss.syntaxes() {
        println!("{}: {:?}", syntax.name, syntax.file_extensions);
    }
}
