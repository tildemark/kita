# KITA (Kiosk Inventory & Transaction Assistant)

KITA is a modern Sari-Sari Store POS and Inventory System designed to seamlessly blend point-of-sale operations with full-stack inventory tracking. 

Built with a dual-mode approach in mind, KITA can run as a Cloud SaaS application for multi-branch operations, or locally as a standalone offline application for independent stores.

## Modules

The application is split into two core modules:
*   **LISTA (Local Inventory & Sales Tracking Application):** The inventory management and sales ledger providing Backend CRUD operations and an Admin UI.
*   **SUKI (Sales Utility & Kiosk Interface):** The fast-paced Point-of-Sale (POS) checkout interface designed for rapid transactions.

## Technology Stack

### Backend (`kita-core`)
*   **Language:** Rust
*   **Framework:** Axum (REST API)
*   **Database:** SurrealDB (Configured for multi-tenancy. Abstracted to support remote cloud instances or embedded RocksDB).
*   **Authentication:** JWT Middleware

### Frontend (`kita-web`)
*   **Framework:** Next.js (App Router, static export compatible)
*   **Styling & UI:** Tailwind CSS, Shadcn UI, Radix primitives
*   **State Management:** Zustand (Handling dynamic API contexts for offline/Cloud switching)

## Project Structure

This is a monorepo setup containing both the frontend and backend services:

```
kita/
├── kita-core/      # Rust & Axum backend API server
│   ├── src/        # Backend source code and routes
│   └── Cargo.toml  # Rust dependencies
├── kita-web/       # Next.js frontend web application
│   ├── src/        # React components, pages, and store
│   └── package.json# Node.js dependencies
├── schema.surql    # SurrealDB schema definitions
├── CHANGELOG.md    # Release notes and version history
└── README.md       # Project documentation
```

## Getting Started (Development Mode)

### Prerequisites
*   [Rust](https://rustup.rs/) (cargo)
*   [Node.js](https://nodejs.org/) (npm wrapper / npx)
*   [SurrealDB](https://surrealdb.com/docs/surrealdb/installation) (Server running locally or remotely if not using embedded Mode)

### Running the Backend

1.  Navigate to the `kita-core` directory:
    ```bash
    cd kita-core
    ```
2.  Build the backend (optional, but recommended to ensure all dependencies compile):
    ```bash
    cargo build
    ```
3.  Start the Axum server:
    ```bash
    cargo run
    ```
    The server will start on `http://0.0.0.0:8080`.

### Running the Frontend

1.  Navigate to the `kita-web` directory:
    ```bash
    cd kita-web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the frontend statically:
    ```bash
    npm run build
    ```
4.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
    The web app will be accessible at `http://localhost:3000`.

## Architecture Roadmap
- **Phase 1 & 2:** Cloud SaaS Setup (Complete) — Rust API server + Next.js frontend over HTTP REST.
- **Phase 3:** Desktop App (Complete) — Tauri shell packaging the Next.js static export with `kita-core` as an embedded sidecar.

## Deploying the Desktop App (Windows)

### Step 1 — Enable Persistent Storage (RocksDB)

> **Required before building the installer.** By default `kita-core` uses an in-memory database, meaning all data is lost when the app closes. For a real deployment you must switch to **RocksDB** (embedded file-based storage).

**1a. Install LLVM** (required to compile RocksDB bindings):
```powershell
winget install LLVM.LLVM
# Then restart your terminal so LLVM is on PATH
```

**1b. Enable the feature flag** in `kita-core/Cargo.toml`:
```toml
# Change this line:
surrealdb = { version = "2.0.4", features = ["kv-mem"] }

# To this:
surrealdb = { version = "2.0.4", features = ["kv-mem", "kv-rocksdb"] }
```

**1c. Update `kita-core/.env`** to remove the memory override:
```env
JWT_SECRET=<your-production-secret>
# Remove or comment out: KITA_DB_URI=memory
# The sidecar will default to: rocksdb://./kita.db
```

### Step 2 — Build the kita-core sidecar binary

```powershell
cd kita-core
cargo build --release

# Copy the binary to the Tauri binaries directory (required naming convention):
Copy-Item target\release\kita-core.exe `
  ..\kita-web\src-tauri\binaries\kita-core-x86_64-pc-windows-msvc.exe
```

### Step 3 — Build the Windows installer

```powershell
cd kita-web
npm run tauri:build
```

The installer will be at:
```
kita-web/src-tauri/target/release/bundle/nsis/KITA_0.3.0_x64-setup.exe
```

### Default Credentials (First Run)

The app auto-seeds a default admin on first launch:

| Username | Password |
|---|---|
| `admin` | `admin123` |

> ⚠️ Change the `JWT_SECRET` in production and update the admin password after first login.

