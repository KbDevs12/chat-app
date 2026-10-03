use std::borrow::Cow;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::{Validate, ValidationError};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct AuthPayload {
    #[validate(email(message = "Format email tidak valid."))]
    pub email: String,
    #[validate(
        length(min = 8, max = 64, message = "Password harus 8-64 karakter"),
        custom(function = "validate_password_strength")
    )]
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub created_at: Option<DateTime<Utc>>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
        }
    }
}

fn validate_password_strength(password: &str) -> Result<(), ValidationError> {
    let has_upper = password.chars().any(|c| c.is_uppercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());
    let has_special = password.chars().any(|c| c.is_ascii_punctuation());

    if has_upper && has_digit && has_special {
        Ok(())
    } else {
        Err(
            ValidationError::new("weak_password").with_message(Cow::Borrowed(
                "Password harus mengandung minimal 1 huruf besar, 1 angka, dan 1 karakter spesial",
            )),
        )
    }
}
