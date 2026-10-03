use serde::{Deserialize, Serialize};
// use chrono::{DateTime, Utc};
// use sqlx::FromRow;
// use uuid::Uuid;

/*
#[derive(Debug, Serialize, Deserialize, FromRow)]
 buat sekarang struct RefreshToken ga dipake
pub struct RefreshToken {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token: String,
    pub is_revoked: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
    */
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: super::user::UserResponse,
}

#[derive(Debug, Deserialize)]
pub struct RefreshTokenPayload {
    pub refresh_token: String,
}
