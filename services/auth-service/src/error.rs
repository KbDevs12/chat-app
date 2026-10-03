use std::collections::HashMap;

use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;
use validator::ValidationErrors;

pub enum AppError {
    BadRequest(String),
    Unauthorized(String),
    InternalServerError(String),
    Conflict(String),
    DatabaseError(sqlx::Error),
    Validation(HashMap<String, Vec<String>>),
}

impl From<ValidationErrors> for AppError {
    fn from(errors: ValidationErrors) -> Self {
        let map: HashMap<String, Vec<String>> = errors
            .field_errors()
            .into_iter()
            .map(|(field, errs)| {
                let messages = errs
                    .iter()
                    .map(|e| {
                        e.message
                            .as_ref()
                            .map(|m| m.to_string())
                            .unwrap_or_else(|| e.code.to_string())
                    })
                    .collect();
                (field.to_string(), messages)
            })
            .collect();

        AppError::Validation(map)
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        if let sqlx::Error::Database(db_err) = &err {
            if db_err.is_unique_violation() {
                return AppError::Conflict("Email sudah terdaftar.".to_string());
            }
        }
        AppError::DatabaseError(err)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, body) = match self {
            AppError::BadRequest(msg) => (
                StatusCode::BAD_REQUEST,
                json!({ "error": msg, "code": "BAD_REQUEST" }),
            ),
            AppError::Unauthorized(msg) => (
                StatusCode::UNAUTHORIZED,
                json!({ "error": msg, "code": "UNAUTHORIZED" }),
            ),
            AppError::Conflict(msg) => (
                StatusCode::CONFLICT,
                json!({ "error": msg, "code": "CONFLICT" }),
            ),
            AppError::InternalServerError(msg) => {
                eprintln!("Internal error: {msg}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({
                        "error": "Terjadi kesalahan internal pada server",
                        "code": "INTERNAL_ERROR"
                    }),
                )
            }
            AppError::DatabaseError(err) => {
                eprintln!("Database error: {:?}", err);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({
                        "error": "Terjadi kesalahan internal pada server",
                        "code": "INTERNAL_ERROR"
                    }),
                )
            }
            AppError::Validation(errors) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                json!({
                    "error": "Validasi gagal",
                    "code": "VALIDATION_ERROR",
                    "details": errors
                }),
            ),
        };

        (status, Json(body)).into_response()
    }
}
