use argon2::{Argon2, password_hash::phc::SaltString};

use crate::error::AppError;

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate();

    let argon2 = Argon2::default();

    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| {
            eprintln!("Error hashing password: {:?}", e);
            AppError::InternalServerError("Gagal memproses password".to_string())
        })
}
