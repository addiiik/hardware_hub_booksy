# Tech Stack

* **Backend:** Python, FastAPI
* **Frontend:** React, Vite
* **Database:** SQLite
* **Authentication:** JWT with HTTP-only cookies

---

# INSTALLATION

## Prerequisites

Ensure you have the following installed on your machine:

- **Python 3.10+**: https://www.python.org/downloads/
- **Node.js (v18+) & npm**: https://nodejs.org/

---

## 1. Backend Setup (FastAPI)

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment to isolate dependencies.

   **macOS / Linux:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

   **Windows (Command Prompt / PowerShell):**

   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install the required Python packages:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend` directory with the following variables:

   ```env
   SECRET_KEY=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   DATABASE_URL=sqlite:///./hardware_hub.db
   ENVIRONMENT=development
   FRONTEND_URL=http://localhost:5173
   COOKIE_DOMAIN=
   ```

   - **Secret Key Generation:** Generate a secure `SECRET_KEY` in your terminal:

     **macOS / Linux**

     ```bash
     python -c "import secrets; print(secrets.token_hex(32))"
     ```

     **Windows**

     ```powershell
     python -c "import secrets; print(secrets.token_hex(32))"
     ```

   - **Gemini API Key:** Obtain your `GEMINI_API_KEY` from **Google AI Studio** by creating an API key and copying it into your `.env` file.

5. Start the FastAPI development server:

   ```bash
   uvicorn main:app --reload
   ```

   - **Backend URL:** http://127.0.0.1:8000
   - **API Docs (Swagger UI):** http://127.0.0.1:8000/docs

---

## 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Create a `.env` file in the `frontend` directory:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. Install the JavaScript dependencies:

   ```bash
   npm install
   ```

4. Start the Vite development server:

   ```bash
   npm run dev
   ```

   - **Frontend URL:** Typically available at `http://localhost:5173` (check the terminal output for the exact port).

---

## Development Workflow

To run the project locally, keep **two terminal windows** open:

### Terminal 1 (Backend)

- Activate the virtual environment.
- Run:

  ```bash
  uvicorn main:app --reload
  ```

### Terminal 2 (Frontend)

- Navigate to the `frontend` directory.
- Run:

  ```bash
  npm run dev
  ```

# Implementation Progress & Architecture

## 1. The Management Engine (Admin & Users) — ✅ Fully Implemented

* **Role-Based Access Control (RBAC):**
  * **User Role:** Access to rent and return hardware.
  * **Admin Role:** Access to elevated pages for hardware management, user account management, item details, and system monitoring.
* **Authentication:** Simple, secure login screen. System entry is restricted strictly to accounts created by an admin.
* **Hardware Management Page:** Dedicated admin view to add new hardware, delete existing hardware, and toggle repair status as well as access to item details.
* **User Management Page:** Admin view to create and remove user accounts.
* **Smart Dashboard:** Comprehensive hardware list with universal table filtering and search capabilities (e.g., search by purchase year such as `2024`, status, brand, or any text field). Additional toggle for AI mode which enables Semantic Search.

#### 🌟 Extras & Architectural Improvements
* **Relational Database Refactor (History & Notes):**
  * Transformed initial seed data string fields (`history`, `notes`) into dedicated database tables to ensure data integrity:
    * **Rental History Table:** Tracks user details, checkout date, and return date.
    * **Repair History Table:** Tracks maintainer details, repair start date, and completion date.
    * **Notes Table:** Supports multiple notes per item with author and timestamp tracking. Accessible to all admins.
* **Soft Account Deletion:** Replaced hard deletions with a soft-delete database flag. Preserves historical audit logs while preventing inactive users from logging in or re-registering with the same email unless fully purged.

---

## 2. The Rental Engine (Business Logic) — ✅ Fully Implemented

* **Core Workflows:** Guards and state validation to enforce valid rental flows (e.g., blocking rentals of devices marked as "In Use" or "Repair").

#### 🌟 Extras & Architectural Improvements
* **Admin Override Capabilities:** Admins have administrative rights to return items on behalf of other users for administrative convenience.

---

## 3. The AI-Native Layer (Gemini Hybrid Semantic Search) — ✅ Fully Implemented

* **Hybrid Search Engine:** Integrates Google Gemini vector embeddings with structured SQL filters to deliver fast and accurate search results.
* **Structured Query Parser:** Parses natural language input using a structured schema. Employs exact matching for hard attributes (dates, literal categories) while delegating context and intent to the vector search step.
* **Asynchronous Item Indexing (Vector Embeddings) (3 Execution Paths):**
  1. **Seed Indexing:** Automated background task triggering on database initialization.
  2. **On-Creation Indexing:** Background job triggered automatically when an admin adds new hardware.
  3. **Manual Trigger ("Index for AI"):** Fallback action on the hardware page allowing admins to manually re-index items.
* **Indexing Guards:** Added a hardware boolean flag (`is_rentable`) to automatically exclude test hardware or unrentable items from AI indexing and availability lists. Items with name or brand such as "test", "dummy" and similar placeholder names are also automatically excluded from indexing.

---

## 4. 🚀 Extra Unrequested Features

* **Notification System:**
  * **Dedicated Views:** Added a central notification page.
  * **AI Job Status Updates:** Real-time notifications informing admins when background indexing tasks start, succeed, or fail.
  * **Future Extensibility:** Infrastructure is set up to handle future automated system alerts (e.g., overdue device return nudges).

---

# ⚡ Shortcuts & "Hacks"

* **Component Library & Block Design (`shadcn/ui`):**
  * **What was done:** Rather than writing custom UI components from scratch, the interface was constructed using `shadcn/ui` primitives and component blocks. For example, the login view was adapted from a pre-made `shadcn` block and wired up with `react-hook-form` and custom styling to fit the assessment layout.
  * **The "Why":** Building fully accessible, robust, and responsive UI components takes significant time. Leveraging `shadcn/ui` allowed maximum focus on business logic, AI integrations, data integrity, and API stability without sacrificing UI quality.
  * **The "Future":** Given extra time, the components could be further tweaked or converted into a dedicated proprietary design system for complete visual originality.

---

# ⚠ Partial / Missing Features

* **Hardware Editing View:**
  * **Status:** All core functional requirements outlined in the manual were fully met. However, hardware editing, which appeared in the provided wireframe concepts but was not explicitly required in the manual, was deferred in favor of prioritizing robust database schema relations and background AI indexing.

---

# 🔮 Next Steps (24h Roadmap)

1. **UI, UX & Quality of Life (QoL) Improvements:**
   * **Responsive layout and adaptive scaling:** Improve the app’s responsiveness across different screen sizes and resolutions, ensuring that layouts scale properly and look polished on larger screens, tablets, and mobile devices.
   * **Edit Capabilities:** Implement dedicated "Edit Hardware" and "Edit User" dialogs.
   * **Batch Actions:** Add table multi-selection to allow bulk status updates, bulk deletions, or bulk AI re-indexing.
   * **User Settings:** Introduce password changing for users and admin password-reset overrides.
2. **Detailed Specs & Smarter AI Hardware Matching:**
   * Expand hardware database models to track technical specifications (RAM, CPU, GPU, Storage, OS, System Architecture).
   * Upgrade Gemini's semantic search prompt to resolve technical query demands (e.g., *"I need a powerful machine to test a 3D game"* matches laptops with dedicated GPUs and higher RAM).
3. **Advanced AI Inventory Intelligence:**
   * Allow natural language queries over relational data and repair logs (e.g., *"Which devices have had screen damage?"* scans notes and repair history).
   * Add automated background re-indexing triggers whenever hardware properties or notes are updated.
4. **Expanded Notification Engine:**
   * Extend notifications beyond indexing status to include operational alerts (e.g., nudging users holding items past expected durations or informing admins of repair status of an item).

---

# 🏗️ Next Steps (Beyond 24h / Production Architecture)

* **Migration to PostgreSQL:**
  * While SQLite provided an excellent file-based approach for this MVP, moving to PostgreSQL is recommended for a production environment to better support the heavily relational schema (relational histories, notes, soft-deletions) and higher concurrent writing loads.