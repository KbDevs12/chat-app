use argon2::{Argon2, PasswordHash, PasswordVerifier, password_hash::phc::SaltString};

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

pub fn verify_password(password: &str, password_hash: &str) -> Result<bool, AppError> {
    let parsed_hash = PasswordHash::new(password_hash).map_err(|e| {
        eprintln!("Error parsing password hash: {:?}", e);
        AppError::InternalServerError("Format password hash tidak valid".to_string())
    })?;

    let argon2 = Argon2::default();

    Ok(argon2
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}
