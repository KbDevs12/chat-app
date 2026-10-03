use axum::{Json, extract::State, http::StatusCode};

use std::env;

use crate::{
    error::AppError,
    models::{
        token::AuthResponse,
        user::{AuthPayload, User, UserResponse},
    },
    state::AppState,
    utils::{
        hash::{hash_password, verify_password},
        jwt::{generate_access_token, generate_refresh_token},
    },
};

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<AuthPayload>,
) -> Result<(StatusCode, Json<UserResponse>), AppError> {
    if payload.email.trim().is_empty() || payload.password.trim().is_empty() {
        return Err(AppError::BadRequest(
            "Email dan password tidak boleh kosong.".to_string(),
        ));
    }

    let existing_user = sqlx::query!("SELECT id from users where email = $1", payload.email)
        .fetch_optional(&state.db)
        .await?;

    if existing_user.is_some() {
        return Err(AppError::BadRequest("Email sudah terdaftar".to_string()));
    }

    let hashed_password = hash_password(&payload.password)?;

    let user = sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (email, password)
        values ($1, $2)
        RETURNING id, email, password, created_at, updated_at
        "#,
        payload.email,
        hashed_password
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(UserResponse::from(user))))
}
