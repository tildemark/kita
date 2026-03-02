use surrealdb::engine::any::{connect, Any};
use surrealdb::Surreal;
use std::sync::Arc;
use bcrypt::{hash, DEFAULT_COST};
use serde::{Deserialize, Serialize};

pub type Db = Surreal<Any>;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Db>,
    pub jwt_secret: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DbUser {
    pub id: Option<surrealdb::sql::Thing>,
    pub username: String,
    pub password_hash: String,
    pub tenant_id: surrealdb::sql::Thing,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DbItem {
    pub id: Option<surrealdb::sql::Thing>,
    pub name: String,
    pub price: f64,
    pub stock: i64,
    pub tenant_id: surrealdb::sql::Thing,
}

// Used for deserialising COUNT queries safely (no Thing enum involved).
#[derive(Debug, Deserialize)]
struct CountRow {
    count: i64,
}

pub async fn init_db(uri: &str, ns: &str, db_name: &str) -> surrealdb::Result<Surreal<Any>> {
    let db = connect(uri).await?;
    db.use_ns(ns).use_db(db_name).await?;
    Ok(db)
}

/// Applies the schema and idempotently seeds an initial admin user + default tenant.
pub async fn seed_db(db: &Db) -> surrealdb::Result<()> {
    // ── Schema ───────────────────────────────────────────────────────────────
    // Run each DEFINE statement separately to avoid multi-statement parse issues.
    db.query("DEFINE TABLE IF NOT EXISTS tenant SCHEMAFULL").await?;
    db.query("DEFINE FIELD IF NOT EXISTS name       ON TABLE tenant TYPE string").await?;
    db.query("DEFINE FIELD IF NOT EXISTS created_at ON TABLE tenant TYPE datetime DEFAULT time::now()").await?;

    db.query("DEFINE TABLE IF NOT EXISTS user SCHEMAFULL").await?;
    db.query("DEFINE FIELD IF NOT EXISTS username      ON TABLE user TYPE string").await?;
    db.query("DEFINE FIELD IF NOT EXISTS password_hash ON TABLE user TYPE string").await?;
    db.query("DEFINE FIELD IF NOT EXISTS tenant_id     ON TABLE user TYPE record<tenant>").await?;

    db.query("DEFINE TABLE IF NOT EXISTS item SCHEMAFULL").await?;
    db.query("DEFINE FIELD IF NOT EXISTS name       ON TABLE item TYPE string").await?;
    db.query("DEFINE FIELD IF NOT EXISTS price      ON TABLE item TYPE number ASSERT $value >= 0").await?;
    db.query("DEFINE FIELD IF NOT EXISTS stock      ON TABLE item TYPE number ASSERT $value >= 0").await?;
    db.query("DEFINE FIELD IF NOT EXISTS tenant_id  ON TABLE item TYPE record<tenant>").await?;
    db.query("DEFINE FIELD IF NOT EXISTS created_at ON TABLE item TYPE datetime DEFAULT time::now()").await?;

    db.query("DEFINE TABLE IF NOT EXISTS transaction SCHEMAFULL").await?;
    db.query("DEFINE FIELD IF NOT EXISTS total_amount ON TABLE transaction TYPE number ASSERT $value >= 0").await?;
    db.query("DEFINE FIELD IF NOT EXISTS tenant_id   ON TABLE transaction TYPE record<tenant>").await?;
    db.query("DEFINE FIELD IF NOT EXISTS created_by  ON TABLE transaction TYPE record<user>").await?;
    db.query("DEFINE FIELD IF NOT EXISTS created_at  ON TABLE transaction TYPE datetime DEFAULT time::now()").await?;

    // ── Seed default tenant + admin ───────────────────────────────────────────
    // COUNT returns a plain integer — safe to deserialize, no Thing enum.
    let mut r = db
        .query("SELECT count() AS count FROM user WHERE username = 'admin' GROUP ALL")
        .await?;
    let counts: Vec<CountRow> = r.take(0)?;
    let already_seeded = counts.first().map(|c| c.count).unwrap_or(0) > 0;

    if !already_seeded {
        tracing::info!("Seeding default tenant and admin user...");

        // UPSERT with explicit IDs — idempotent, no read-back needed.
        db.query("UPSERT tenant:default SET name = 'Default Store'").await?;

        let password_hash = hash("admin123", DEFAULT_COST)
            .expect("Failed to hash default password");

        // Use $hash param to safely embed the bcrypt string (avoids format! injection).
        db.query(
            "UPSERT user:admin SET username = 'admin', password_hash = $hash, tenant_id = tenant:default",
        )
        .bind(("hash", password_hash))
        .await?;

        tracing::info!("Default admin seeded — username: 'admin', password: 'admin123'");
    }

    Ok(())
}
