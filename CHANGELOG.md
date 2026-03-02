# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to Major.Minor.Patch format.

Major: New Feature
Minor: New Functionality
Patch: Bug Fix

## [0.2.0] - 2026-03-03
### Added
- Real SurrealDB-backed API handlers replacing all stub implementations.
- `POST /api/auth/login` — bcrypt password verification with signed JWT issuance (8-hour expiry).
- `GET /api/lista/items` — tenant-scoped item listing from SurrealDB.
- `POST /api/lista/items` — tenant-tagged item creation in SurrealDB.
- `POST /api/suki/checkout` — cart checkout with per-item stock decrement and transaction record creation.
- Startup schema application (via `seed_db`) without requiring a separate migration step.
- Idempotent default tenant (`tenant:default`) and admin user (`user:admin`) seeding using `UPSERT`.
- `JWT_SECRET` loaded from `.env` via `dotenvy`; warns if unset.
- `kv-mem` SurrealDB feature flag for in-process memory engine in dev.
- `/login` page in `kita-web` — JWT persisted to Zustand store on success.
- LISTA page wired to live API with Add Item modal form.
- SUKI page wired to live API — real item grid, cart qty controls, checkout receipt.
- `NEXT_PUBLIC_API_BASE_URL` env var support in `kita-web` via `.env.local`.
- Zustand persist `merge` to always prefer env var URL over cached localStorage.

## [0.1.1] - 2026-03-02

### Added
- Created `kita-core` backend service in Rust with Axum.
- Added basic generic SurrealDB connection layer handling remote vs embedded possibilities.
- Implemented `/auth/login`, `/lista/items`, and `/suki/checkout` stub routes.
- Configured dummy JWT Authentication middleware.
- Implemented multi-tenant SurrealQL schema.
- Added `kita-web` frontend in Next.js using App Router (configured for static export).
- Integrated Zustand store for dynamic API base URL and offline/SaaS mode.
- Built Onboarding setup screen for selecting connection mode.
- Sculpted `kita.sanchez.ph` Dark Mode Landing Page.
- Stubbed Next.js layouts structurally matching Shadcn UI (Table for LISTA, Cards for SUKI POS).

