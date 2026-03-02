**Role & Objective**
Act as an expert Full-Stack Rust and Next.js developer. We are building a modern Sari-Sari Store POS and Inventory System named **KITA** (Kiosk Inventory & Transaction Assistant).
The application is split into two core modules:
* **LISTA:** The inventory management and sales ledger (Backend CRUD & Admin UI).
* **SUKI:** The fast-paced Point-of-Sale (POS) checkout interface.


We are using a phased approach, starting with a Cloud SaaS architecture (hosted on an ARM64 Linux server), but the codebase must be designed so the backend can eventually be embedded directly into a Tauri Windows app for offline local use.
**The Tech Stack**
* **Backend:** Rust with Axum (REST API).
* **Database:** SurrealDB.
* **Frontend:** Next.js (App Router, static export compatible), Tailwind CSS, Shadcn UI, Radix primitives.


**Task: Phase 1 & 2 Blueprint (Cloud SaaS Setup)**
Please provide the initial code and project structure to achieve the following:
**1. Workspace & Monorepo Setup**
* Provide terminal commands to set up a workspace with two main directories: `kita-core` (Rust backend) and `kita-web` (Next.js frontend).


**2. The Rust + Axum + SurrealDB Backend (`kita-core`)**
* Write the `Cargo.toml` dependencies and the `main.rs` setup.
* Configure the Axum server to run on `0.0.0.0:8080` with permissive CORS.
* Initialize a SurrealDB connection. *Crucial:* Abstract the database connection so we can easily swap between a remote connection (e.g., `ws://oci-instance-ip:8000`) and an embedded `RocksDb` instance later.
* Implement basic JWT Authentication middleware in Axum.
* Create API routes and handlers categorized by module:
* **Auth:** `POST /api/auth/login` (Returns JWT)
* **LISTA (Inventory):** `GET /api/lista/items`, `POST /api/lista/items` (Protected routes)
* **SUKI (POS):** `POST /api/suki/checkout` (Protected, process transaction and update LISTA)


* Provide the SurrealQL schema required for multi-tenancy (ensuring User A/Store A cannot query User B/Store B's inventory).


**3. The Next.js Frontend (`kita-web`)**
* Provide the `next.config.js` ensuring it is configured for `output: 'export'` (so it can be served as static files by Rust/Tauri later).
* Write a globally accessible configuration utility (e.g., using Zustand) that manages the `API_BASE_URL`. This must be dynamic so we can switch it between `https://api.kita.com` and `http://localhost:8080` in the future.
* Write the layout structure accommodating the two modules:
* **LISTA Route (`/lista`):** A data table view (Shadcn Table) to manage inventory items.
* **SUKI Route (`/suki`):** A clean, dense POS UI layout (using Shadcn Cards) with a split-screen for quick-add inventory items on the left and the active cart on the right.

**4. Dual-Mode Preparation (The Setup Screen)**
* Write a simple `Onboarding.tsx` component. It should have two large, modern buttons: "Run KITA Locally (Offline)" and "Connect KITA to Cloud (SaaS)".
* Write the logic to save this selection to `localStorage` and dynamically update the frontend's API target based on the choice.


**5. Landing Page Outline**
* Provide the base page structure for a modern, dark-mode landing page tailored to `kita.sanchez.ph`. It must include three distinct Call-to-Action buttons: "Live Demo", "View Source (GitHub)", and "Download for Windows".


**Terms to remember:**  
KITA (Kiosk Inventory & Transaction Assistant)  
SUKI (Sales Utility & Kiosk Interface)  
LISTA (Local Inventory & Sales Tracking Application)  

use changelog.md in the format Major.Minor.Patch. eg v0.1.1  
Major: New Feature  
Minor: New Functionality  
Patch: Bug Fix
