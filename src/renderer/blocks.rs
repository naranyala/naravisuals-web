use crate::renderer::RuntimeRenderer;
use leptos::*;
use md_compiler::parser::ast::Node;

pub struct BlockRenderer;

impl BlockRenderer {
    pub fn render_heading(level: u8, children: &[Node]) -> View {
        let id = RuntimeRenderer::generate_id(children);
        let inner = RuntimeRenderer::render_inline(children);
        match level {
            1 => view! { <h1 id=id>{inner}</h1> }.into_view(),
            2 => view! { <h2 id=id>{inner}</h2> }.into_view(),
            3 => view! { <h3 id=id>{inner}</h3> }.into_view(),
            4 => view! { <h4 id=id>{inner}</h4> }.into_view(),
            5 => view! { <h5 id=id>{inner}</h5> }.into_view(),
            _ => view! { <h6 id=id>{inner}</h6> }.into_view(),
        }
    }

    pub fn render_list(items: &[md_compiler::parser::ast::ListItem], ordered: bool) -> View {
        let list_items = items
            .iter()
            .map(|item| {
                let is_task = item.checked.is_some();
                let checked = item.checked.unwrap_or(false);
                if is_task {
                    view! {
                        <li>
                            <input type="checkbox" checked=checked disabled />
                            {RuntimeRenderer::render_nodes(&item.children)}
                        </li>
                    }
                    .into_view()
                } else {
                    view! { <li>{RuntimeRenderer::render_nodes(&item.children)}</li> }.into_view()
                }
            })
            .collect::<Vec<_>>();

        if ordered {
            view! { <ol>{list_items}</ol> }.into_view()
        } else {
            view! { <ul>{list_items}</ul> }.into_view()
        }
    }

    pub fn render_table(headers: &[Node], rows: &[Vec<Node>]) -> View {
        view! {
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {headers.iter().map(|h| view! { <th>{RuntimeRenderer::render_inline(std::slice::from_ref(h))}</th> }).collect::<Vec<_>>()}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.iter().map(|row| view! {
                            <tr>
                                {row.iter().map(|cell| view! { <td>{RuntimeRenderer::render_inline(std::slice::from_ref(cell))}</td> }).collect::<Vec<_>>()}
                            </tr>
                        }).collect::<Vec<_>>()}
                    </tbody>
                </table>
            </div>
        }.into_view()
    }
}
