use crate::{
    handlers::auth::{login, register},
    state::AppState,
};
use axum::{
    Router,
    routing::{get, post},
};

pub fn app_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(|| async { "Auth Service is OK." }))
        .route("/api/auth/register", post(register))
        .route("/api/auth/register", post(login))
        .with_state(state)
}
