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
- **Phase 1 & 2:** Cloud SaaS Setup (Current) - Running backend as a standalone Rust API server and Next.js frontend communicating with it over HTTP REST.
- **Phase 3:** Desktop App packaging - Serving the exported Next.js static files via Tauri with the Rust backend integrated natively for true offline-first Windows usage.
