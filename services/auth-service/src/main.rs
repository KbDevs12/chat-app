mod error;
mod handlers;
mod models;
mod router;
mod state;
mod utils;

use std::env;

use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;

use crate::{router::app_router, state::AppState};

#[tokio::main]
async fn main() {
    dotenv().ok();
    let database_url =
        env::var("DATABASE_URL").expect("Variable DATABASE_URL harus diatur di dalam file .env");

    println!("Menghubungkan ke database..");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Gagal terhubung ke database.");

    let state = AppState { db: pool };

    let app = app_router(state);

    let port = "0.0.0.0:8080";
    let listener = TcpListener::bind(port).await.unwrap();

    println!("Auth Service berjalan di: http://{}", { port });
    axum::serve(listener, app).await.unwrap();
}
