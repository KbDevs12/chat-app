use axum::{Json, extract::State, http::StatusCode};
use validator::Validate;

use std::env;

use crate::{
    error::AppError,
    models::{
        token::{AuthResponse, RefreshTokenPayload},
        user::{AuthPayload, User, UserResponse},
    },
    state::AppState,
    utils::{
        hash::{hash_password, verify_password},
        jwt::{generate_access_token, generate_refresh_token, verify_token},
    },
};

pub async fn register(
    State(state): State<AppState>,
    Json(mut payload): Json<AuthPayload>,
) -> Result<(StatusCode, Json<UserResponse>), AppError> {
    payload.email = payload.email.trim().to_lowercase();
    payload.validate()?;

    if payload.email.trim().is_empty() || payload.password.trim().is_empty() {
        return Err(AppError::BadRequest(
            "Email dan password tidak boleh kosong.".to_string(),
        ));
    }

    let existing_user = sqlx::query!("SELECT id from users where email = $1", payload.email)
        .fetch_optional(&state.db)
        .await?;

    if existing_user.is_some() {
        return Err(AppError::Conflict("Email sudah terdaftar".to_string()));
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

pub async fn login(
    State(state): State<AppState>,
    Json(mut payload): Json<AuthPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    payload.email = payload.email.trim().to_lowercase();
    payload.validate()?;

    let jwt_secret = env::var("JWT_SECRET")
        .map_err(|_| AppError::InternalServerError("Terjadi kesalahan pada server.".to_string()))?;

    let user = sqlx::query_as!(
        User,
        "SELECT id, email, password, created_at, updated_at FROM users where email = $1",
        payload.email
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Email atau Password salah".to_string()))?;

    let is_password_valid = verify_password(&payload.password, &user.password)?;
    if !is_password_valid {
        return Err(AppError::Unauthorized("Password salah.".to_string()));
    }

    let access_token = generate_access_token(user.id, &user.email, &jwt_secret)?;
    let refresh_token = generate_refresh_token(user.id, &user.email, &jwt_secret)?;

    sqlx::query!(
        "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
        user.id,
        refresh_token
    )
    .execute(&state.db)
    .await?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token,
        user: (UserResponse::from(user)),
    }))
}

pub async fn refresh_token(
    State(state): State<AppState>,
    Json(payload): Json<RefreshTokenPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    let jwt_secret = env::var("JWT_SECRET")
        .map_err(|_| AppError::InternalServerError("Terjadi kesalahan pada server.".to_string()))?;

    let claims = verify_token(&payload.refresh_token, &jwt_secret)?;

    let token_record = sqlx::query!(
        "SELECT id, is_revoked FROM refresh_tokens where token = $1 AND user_id = $2",
        payload.refresh_token,
        claims.sub
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Refresh token tidak ditemukan".to_string()))?;

    if token_record.is_revoked {
        return Err(AppError::Unauthorized(
            "Refresh token sudah tidak berlaku".to_string(),
        ));
    }

    let user = sqlx::query_as!(
        User,
        "SELECT id, email, password, created_at, updated_at FROM users WHERE id = $1",
        claims.sub
    )
    .fetch_one(&state.db)
    .await?;

    sqlx::query!(
        "UPDATE refresh_tokens SET is_revoked = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        token_record.id
    )
    .execute(&state.db)
    .await?;

    let new_access_token = generate_access_token(user.id, &user.email, &jwt_secret)?;
    let new_refresh_token = generate_refresh_token(user.id, &user.email, &jwt_secret)?;

    sqlx::query!(
        "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
        user.id,
        new_refresh_token
    )
    .execute(&state.db)
    .await?;

    Ok(Json(AuthResponse {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
        user: UserResponse::from(user),
    }))
}

pub async fn logout(
    State(state): State<AppState>,
    Json(payload): Json<RefreshTokenPayload>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query!(
        "UPDATE refresh_tokens SET is_revoked = TRUE, updated_at = CURRENT_TIMESTAMP where token = $1 AND is_revoked = false",
        payload.refresh_token
    )
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::BadRequest(
            "Token tidak valid atau sudah kadaluarsa".to_string(),
        ));
    }

    Ok(StatusCode::NO_CONTENT)
}
