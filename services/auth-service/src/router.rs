use crate::state::AppState;
use axum::{Router, routing::get};

pub fn app_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(|| async { "Auth Service is OK." }))
        .with_state(state)
}
