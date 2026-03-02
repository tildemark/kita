use axum::{
    extract::{Extension, State},
    routing::{get, post},
    Json, Router,
};
use bcrypt::verify;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::auth::{generate_token, Claims};
use crate::db::{AppState, DbItem, DbUser};

// ─── Request / Response Types ───────────────────────────────────────────────

#[derive(Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Deserialize)]
struct CreateItemRequest {
    name: String,
    price: f64,
    stock: i64,
}

#[derive(Serialize)]
struct ItemResponse {
    id: String,
    name: String,
    price: f64,
    stock: i64,
}

#[derive(Deserialize)]
struct CheckoutItem {
    id: String,
    qty: i64,
}

#[derive(Deserialize)]
struct CheckoutRequest {
    items: Vec<CheckoutItem>,
}

// ─── Routers ────────────────────────────────────────────────────────────────

/// Public routes — no auth required.
pub fn public_router() -> Router<AppState> {
    Router::new().route("/auth/login", post(login_handler))
}

/// Protected handler routes — auth middleware is applied in main.rs.
pub fn protected_handlers() -> Router<AppState> {
    Router::new()
        .route("/lista/items", get(get_items).post(create_item))
        .route("/suki/checkout", post(suki_checkout))
}

// ─── Handlers ───────────────────────────────────────────────────────────────

/// POST /api/auth/login
async fn login_handler(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<Value>, (axum::http::StatusCode, String)> {
    let username = body.username.clone();
    let mut result = state
        .db
        .query("SELECT * FROM user WHERE username = $username LIMIT 1")
        .bind(("username", username))
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {e}")))?;

    let users: Vec<DbUser> = result
        .take(0)
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Deserialize: {e}")))?;

    let user = users
        .into_iter()
        .next()
        .ok_or((axum::http::StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()))?;

    let valid = verify(&body.password, &user.password_hash)
        .map_err(|_| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Hash error".to_string()))?;

    if !valid {
        return Err((axum::http::StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
    }

    let user_id = user.id.as_ref().map(|t| t.to_string()).unwrap_or_default();
    let tenant_id = user.tenant_id.to_string();

    let token = generate_token(&user_id, &tenant_id, &state.jwt_secret)
        .map_err(|_| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Token error".to_string()))?;

    Ok(Json(json!({ "token": token })))
}

/// GET /api/lista/items (protected)
async fn get_items(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<Vec<ItemResponse>>, (axum::http::StatusCode, String)> {
    let tid = claims.tenant_id.clone();
    let mut result = state
        .db
        .query("SELECT * FROM item WHERE tenant_id = type::thing($tid)")
        .bind(("tid", tid))
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {e}")))?;

    let items: Vec<DbItem> = result
        .take(0)
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Deserialize: {e}")))?;

    let response = items
        .into_iter()
        .map(|i| ItemResponse {
            id: i.id.map(|t| t.to_string()).unwrap_or_default(),
            name: i.name,
            price: i.price,
            stock: i.stock,
        })
        .collect();

    Ok(Json(response))
}

/// POST /api/lista/items (protected)
async fn create_item(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<CreateItemRequest>,
) -> Result<Json<Value>, (axum::http::StatusCode, String)> {
    let name = body.name.clone();
    let tid = claims.tenant_id.clone();

    let result: Option<serde_json::Value> = state
        .db
        .query("CREATE item SET name = $name, price = $price, stock = $stock, tenant_id = type::thing($tid)")
        .bind(("name", name))
        .bind(("price", body.price))
        .bind(("stock", body.stock))
        .bind(("tid", tid))
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {e}")))?
        .take(0)
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Deserialize: {e}")))?;

    let id = result.as_ref().and_then(|v| v["id"].as_str()).unwrap_or("unknown").to_string();
    Ok(Json(json!({ "status": "success", "id": id })))
}

/// POST /api/suki/checkout (protected)
async fn suki_checkout(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<CheckoutRequest>,
) -> Result<Json<Value>, (axum::http::StatusCode, String)> {
    let mut total: f64 = 0.0;
    let tid = claims.tenant_id.clone();
    let uid = claims.sub.clone();

    for line in body.items {
        let item_id = line.id.clone();
        let mut q = state
            .db
            .query("SELECT price, stock FROM type::thing($id)")
            .bind(("id", item_id.clone()))
            .await
            .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB: {e}")))?;

        let rows: Vec<serde_json::Value> = q
            .take(0)
            .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Deser: {e}")))?;

        let item = rows
            .into_iter()
            .next()
            .ok_or((axum::http::StatusCode::NOT_FOUND, format!("Item {item_id} not found")))?;

        let price = item["price"].as_f64().unwrap_or(0.0);
        let stock = item["stock"].as_i64().unwrap_or(0);

        if stock < line.qty {
            return Err((
                axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                format!("Insufficient stock for {item_id}"),
            ));
        }

        state
            .db
            .query("UPDATE type::thing($id) SET stock -= $qty")
            .bind(("id", item_id))
            .bind(("qty", line.qty))
            .await
            .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Update: {e}")))?;

        total += price * line.qty as f64;
    }

    let tx: Option<serde_json::Value> = state
        .db
        .query("CREATE transaction SET total_amount = $total, tenant_id = type::thing($tid), created_by = type::thing($uid)")
        .bind(("total", total))
        .bind(("tid", tid))
        .bind(("uid", uid))
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("TX create: {e}")))?
        .take(0)
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Deser: {e}")))?;

    let tx_id = tx.as_ref().and_then(|v| v["id"].as_str()).unwrap_or("unknown").to_string();

    Ok(Json(json!({
        "status": "success",
        "transaction_id": tx_id,
        "total_amount": total
    })))
}
