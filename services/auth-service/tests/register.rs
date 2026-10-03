mod common;

use axum::http::StatusCode;
use serde_json::json;
use sqlx::PgPool;

#[sqlx::test]
async fn reg_001_register_with_valid_credentials(db: PgPool) {
    let app = common::app(db.clone());
    let payload = json!({
        "email": "test@example.com",
        "password": "Password123!"
    });

    let (status, body) = common::post_json(app, "/api/auth/register", payload).await;

    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["email"], "test@example.com");
    assert!(body["id"].is_string());
    assert!(
        body.get("password").is_none(),
        "password tidak boleh ada di response"
    );

    let stored: String = sqlx::query_scalar("SELECT password FROM users WHERE email = $1")
        .bind("test@example.com")
        .fetch_one(&db)
        .await
        .unwrap();
    assert!(
        stored.starts_with("$argon2"),
        "password harus tersimpan sebagai hash"
    );
}
