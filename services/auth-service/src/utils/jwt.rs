use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub email: String,
    pub exp: usize,
    pub iat: usize,
}

pub fn generate_access_token(user_id: Uuid, email: &str, secret: &str) -> Result<String, AppError> {
    let now = Utc::now();
    let expiration = now + Duration::minutes(15);

    let claims = Claims {
        sub: user_id,
        email: email.to_string(),
        exp: expiration.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| {
        eprintln!("Error generating access token: {}", e);
        AppError::InternalServerError("Gagal membuat access token.".to_string())
    })
}

pub fn generate_refresh_token(
    user_id: Uuid,
    email: &str,
    secret: &str,
) -> Result<String, AppError> {
    let now = Utc::now();
    let expiration = now + Duration::days(7);

    let claims = Claims {
        sub: user_id,
        email: email.to_string(),
        exp: expiration.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| {
        eprintln!("Error generating refresh token: {}", e);
        AppError::InternalServerError("Gagal membuat refresh token.".to_string())
    })
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| AppError::Unauthorized("Token tidak valid atau sudak kadaluarsa".to_string()))
}
