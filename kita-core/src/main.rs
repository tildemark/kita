mod auth;
mod db;
mod routes;

use axum::Router;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load .env file for local dev (silently ignore if absent in production)
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt::init();

    // Read JWT secret from environment (with a dev fallback)
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| {
        tracing::warn!("JWT_SECRET not set — using insecure default. Set it in .env!");
        "kita_dev_secret_change_me_in_production".to_string()
    });

    // DB connection — defaults to a local SurrealDB server.
    // Override via env vars for remote/production.
    let db_uri = std::env::var("KITA_DB_URI")
        .unwrap_or_else(|_| "ws://localhost:8000".to_string());
    let db_user = std::env::var("SURREAL_USER").ok();
    let db_pass = std::env::var("SURREAL_PASS").ok();

    tracing::info!("Connecting to SurrealDB at: {}", db_uri);

    // Connect to SurrealDB
    let db = db::init_db(
        &db_uri, "kita", "kita",
        db_user.as_deref(),
        db_pass.as_deref(),
    ).await?;

    // Apply schema and seed default admin user
    db::seed_db(&db).await?;

    let state = db::AppState {
        db: Arc::new(db),
        jwt_secret,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Protected routes — apply JWT middleware with state access
    let protected = routes::protected_handlers()
        .route_layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth::auth_middleware,
        ));

    let app = Router::new()
        .nest("/api", routes::public_router())
        .nest("/api", protected)
        .layer(cors)
        .with_state(state);

    let addr = "0.0.0.0:8080";
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("KITA backend listening on http://{}", addr);
    axum::serve(listener, app).await?;

    Ok(())
}
