use crate::{
    handlers::auth::{login, logout, refresh_token, register},
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
        .route("/api/auth/login", post(login))
        .route("/api/auth/refresh", post(refresh_token))
        .route("/api/auth/logout", post(logout))
        .with_state(state)
}
