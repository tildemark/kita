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

    // DB URI: default to rocksdb for desktop persistence.
    // Override with KITA_DB_URI=memory for dev/testing.
    let db_uri = std::env::var("KITA_DB_URI")
        .unwrap_or_else(|_| "rocksdb://./kita.db".to_string());

    tracing::info!("Connecting to SurrealDB at: {}", db_uri);

    // Connect to SurrealDB
    let db = db::init_db(&db_uri, "kita", "kita").await?;

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
