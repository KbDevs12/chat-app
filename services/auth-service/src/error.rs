use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

pub enum AppError {
    BadRequest(String),
    Unauthorized(String),
    InternalServerError(String),
    DatabaseError(sqlx::Error),
}

impl From<sqlx::Error> for AppError {
    fn from(value: sqlx::Error) -> Self {
        AppError::DatabaseError(value)
    }
}
