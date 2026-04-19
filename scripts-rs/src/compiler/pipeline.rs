use crate::compiler::unit::CompilationUnit;
use crate::compiler::context::CompilationContext;
use pulldown_cmark::Event;

pub trait CompilerMiddleware {
    fn name(&self) -> &'static str;
    
    fn on_ingest(&mut self, _unit: &mut CompilationUnit, _ctx: &mut CompilationContext) {}
    fn on_pre_parse(&mut self, _unit: &mut CompilationUnit, _ctx: &mut CompilationContext) {}
    fn on_transform(&mut self, _unit: &mut CompilationUnit, _ctx: &mut CompilationContext) {}
    
    // New hook for token-aware parsing
    fn on_transform_events<'a>(&mut self, _events: &mut Vec<Event<'a>>, _ctx: &mut CompilationContext) {}
    
    fn on_assemble(&mut self, _units: &mut [CompilationUnit], _ctx: &mut CompilationContext) {}
    fn on_post_process(&mut self, _unit: &mut CompilationUnit, _ctx: &mut CompilationContext) {}
}

// Macro to implement CompilerMiddleware for tuples
#[allow(non_snake_case)]
macro_rules! impl_middleware_for_tuple {
    ($($name:ident),*) => {
        impl<$($name: CompilerMiddleware),*> CompilerMiddleware for ($($name,)*) {
            fn name(&self) -> &'static str {
                "TuplePipeline"
            }

            #[allow(non_snake_case)]
            fn on_ingest(&mut self, unit: &mut CompilationUnit, ctx: &mut CompilationContext) {
                let ($($name,)*) = self;
                $($name.on_ingest(unit, ctx);)*
            }

            #[allow(non_snake_case)]
            fn on_pre_parse(&mut self, unit: &mut CompilationUnit, ctx: &mut CompilationContext) {
                let ($($name,)*) = self;
                $($name.on_pre_parse(unit, ctx);)*
            }

            #[allow(non_snake_case)]
            fn on_transform(&mut self, unit: &mut CompilationUnit, ctx: &mut CompilationContext) {
                let ($($name,)*) = self;
                $($name.on_transform(unit, ctx);)*
            }

            #[allow(non_snake_case)]
            fn on_transform_events<'a>(&mut self, events: &mut Vec<Event<'a>>, ctx: &mut CompilationContext) {
                let ($($name,)*) = self;
                $($name.on_transform_events(events, ctx);)*
            }

            #[allow(non_snake_case)]
            fn on_assemble(&mut self, units: &mut [CompilationUnit], ctx: &mut CompilationContext) {
                let ($($name,)*) = self;
                $($name.on_assemble(units, ctx);)*
            }

            #[allow(non_snake_case)]
            fn on_post_process(&mut self, unit: &mut CompilationUnit, ctx: &mut CompilationContext) {
                let ($($name,)*) = self;
                $($name.on_post_process(unit, ctx);)*
            }
        }
    };
}

impl_middleware_for_tuple!(A);
impl_middleware_for_tuple!(A, B);
impl_middleware_for_tuple!(A, B, C);
impl_middleware_for_tuple!(A, B, C, D);
impl_middleware_for_tuple!(A, B, C, D, E);
impl_middleware_for_tuple!(A, B, C, D, E, F);
impl_middleware_for_tuple!(A, B, C, D, E, F, G);
impl_middleware_for_tuple!(A, B, C, D, E, F, G, H);
impl_middleware_for_tuple!(A, B, C, D, E, F, G, H, I);
impl_middleware_for_tuple!(A, B, C, D, E, F, G, H, I, J);
impl_middleware_for_tuple!(A, B, C, D, E, F, G, H, I, J, K);
impl_middleware_for_tuple!(A, B, C, D, E, F, G, H, I, J, K, L);
