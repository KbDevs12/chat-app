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
        AppError::DatabaseError(err)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, body) = match self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, json!({ "error": msg })),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, json!({ "error": msg })),
            AppError::InternalServerError(msg) => {
                (StatusCode::INTERNAL_SERVER_ERROR, json!({ "error": msg }))
            }
            AppError::DatabaseError(err) => {
                eprintln!("Database error: {:?}", err);

                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({ "error": "Terjadi kesalahan internal pada server" }),
                )
            }
            AppError::Validation(errors) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                json!({
                    "error": "Validasi gagal",
                    "details": errors
                }),
            ),
        };

        (status, Json(body)).into_response()
    }
}
