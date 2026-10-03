use chrono::{Duration, Utc};
use jsonwebtoken::{EncodingKey, Header, encode};
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
        eprintln!("Error generating access token: ", e);
        AppError::InternalServerError("Gagal membuat access token.".to_string())
    })
}
