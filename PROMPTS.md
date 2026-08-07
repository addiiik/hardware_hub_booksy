# 🗺️ Architectural Prompt Trail & Decision Log

Because prompt logs were not saved line-by-line during rapid iteration, this document outlines the key prompt themes, architectural discussions, and decision points that shaped the application's design.

---

## 1: Project Scoping & Stack Selection

* **Context:** Initial evaluation of requirements, assessment constraints, and rapid MVP delivery.
* **Prompt Intent:**
   > *"I have a technical assessment manual for an internal hardware hub. Can you break down the scope, estimate how long it should take to build, and help me pick a simple tech stack that I can ship fast without overcomplicating things?"*
* **AI Evaluation & Outcome:**
  * **GPT** evaluated backend options and recommended **FastAPI** for native async support and rapid Python development.
  * For the frontend, given existing familiarity with React, **GPT** suggested **Vite** over Vue as well as heavier frameworks like Next.js to avoid SSR complexity for a strictly authenticated internal dashboard.
  * **Styling Architecture:** Evaluated writing individual component-level `.css` files vs. utility-first CSS. Prompted AI on migration strategies, leading to **Tailwind CSS** for accelerated development.
  * **Testing Strategy:** Discussed framework options for testing API endpoints. Decided on **`pytest`** alongside FastAPI's built-in `TestClient` (powered by `httpx`) to write concise integration tests for critical business logic (e.g., preventing rentals of damaged equipment).

---

## 2: Domain Modeling, Auth & Route Security

* **Context:** Securing the application, enforcing role-based access control (RBAC), and moving to a production-grade relational schema.
* **Prompt Strategy:**
  1. **Authentication & Route Guards (`AuthContext` & Protected Routes):**
     * *Prompt:* *"How do we prevent standard users from directly navigating to admin routes or accessing restricted pages?"*
     * *Outcome:* Implemented React `AuthContext` alongside custom `ProtectedRoute` wrapper components to control client-side page access based on user roles, coupled with backend dependency permission checks.
  2. **Authentication Cookie Evolution (Pushing Back on LocalStorage):**
     * *Discussion:* During initial setup, GPT proposed storing JWTs in `localStorage` for quick implementation.
     * *Human Correction:* Pushed back on `localStorage` due to XSS vulnerabilities, directing the architecture toward **JWT tokens delivered via secure, HTTP-only cookies**.
  3. **Relational Disaggregation:**
     * *Discussion:* Pointed out to Gemini during seeding setup that `history` and `notes` strings were redundant and ambiguous.
     * *Architectural Decision:* Refactored flat strings into three dedicated relational tables (`RentalHistory`, `RepairHistory`, `Notes`).
  4. **Soft Account Deletion (`is_active`):**
     * *Prompt:* *"How do we support account removals while preserving audit logs for equipment history?"*
     * *Outcome:* Added `is_active` boolean flags to user models to prevent inactive user logins while keeping rental record references intact.
  5. **Indexing Guard Flag (`is_rentable`):**
     * *Prompt:* *"How can we ensure internal test hardware or maintenance gear isn't indexed by Gemini or rented out by users?"*
     * *Outcome:* Added a hardware-level `is_rentable` flag, acting as a guard across both the UI and AI indexing background tasks.

---

## 3: AI-Native Layer & Async Resiliency

* **Context:** Designing a fast, robust natural language hardware search without prior deep native AI experience.
* **Prompt Strategy:**
  1. **Hybrid Retrieval Strategy:**
     * *Discussion with Claude & GPT:* Brainstormed approaches for semantic search. Evaluated pure vector retrieval vs. pure LLM translation.
     * *Architectural Decision:* Implemented a **Hybrid Retrieval Model**: A structured LLM parser (`_SEARCH_QUERY_SCHEMA`) extracts hard SQL filters (brand, category, date bounds), leaving abstract intent to vector embeddings.
  2. **Decoupling Vector Generation (Background Tasks):**
     * *Correction Prompt:* Gemini originally generated embeddings synchronously during DB seeding. Prompted GPT to help design an asynchronous pipeline using FastAPI `BackgroundTasks` to prevent external API failures from blocking application startup.

---

## 4: UI/UX

* **Context:** Designing intuitive admin interfaces and ensuring reactive state sync across frontend components.
* **Prompt Strategy:**
  1. **Single Source of Truth for Notifications (`NotificationContext`):**
     * *Problem:* The "Mark as Read" action was desynchronized; sidebar notification badges failed to update dynamically without a hard page refresh.
     * *Prompt:* *"Why is the notification count desynced between the sidebar badge and the notifications page?"*
     * *Outcome:* Implemented a global `NotificationContext` as a single source of truth, ensuring instant state updates across navigation sidebars and action triggers when items are marked as read.
  2. **Item Details Layout:**
     * *Prompt:* *"What is the cleanest UX for displaying item specs, author-tracked notes, rental history, and repair history in a single view?"*
     * *AI Suggestion:* Gemini proposed a **Tabbed Dialog Modal** (Overview, Notes, Rental History, Maintenance), keeping context contained without cluttering the main table.
  3. **Notification Engine Page Migration:**
     * *Discussion:* Pivoted from an overcrowded sidebar dropdown menu to a dedicated **Notifications Page** featuring paginated real-time status updates for AI background indexing jobs.
  4. **Notification UX Improvement:**
     * *Prompt:* *"Let's improve the notification system, add title property to notification. On the admin notification page show only the title initially and when the user expands it, display the title at the top and the full content below when clicked. While you're at it, add hardware_id and hardware_serial_number to the notifications the server is currently sending."*
     * *Outcome:* Expanded the notification schema with `title`, `author`, and `date` attributes, and updated the `AdminNotificationPage` UI to render a title-only list that expands to display the full notification body upon click. Appended `hardware_id` and `hardware_serial_number` details directly into notification message contents.