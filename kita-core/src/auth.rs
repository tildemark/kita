use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use chrono::{Duration, Utc};

use crate::db::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,       // user ID
    pub tenant_id: String, // tenant ID
    pub exp: usize,        // expiry timestamp (Unix)
}

/// Generate a signed JWT for the given user/tenant.
pub fn generate_token(user_id: &str, tenant_id: &str, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiry = Utc::now()
        .checked_add_signed(Duration::hours(8))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        tenant_id: tenant_id.to_string(),
        exp: expiry,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

/// Axum middleware: validate Bearer JWT, inject Claims into request extensions.
pub async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    let headers = req.headers();
    let auth_header = headers
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .filter(|s| s.starts_with("Bearer "));

    let token = match auth_header {
        Some(h) => &h[7..],
        None => return Err((StatusCode::UNAUTHORIZED, "Missing Token")),
    };

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid Token"))?;

    req.extensions_mut().insert(token_data.claims);

    Ok(next.run(req).await)
}
