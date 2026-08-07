# 🤖 AI Development Log

## 1. Tooling Strategy

A multi-model strategy was leveraged throughout the development cycle, utilizing each LLM for its distinct strengths:

* **ChatGPT (OpenAI):** Served as an architectural sparring partner and sounding board. Used to brainstorm ideas, critique proposed technical solutions, push back against suboptimal implementations, and provide high-level design feedback.
* **Gemini (Google):** Acted as the primary coding engine. Handled multi-file frontend state updates, test generation, backend file restructuring, and rapid code generation across the repository.
* **Claude (Anthropic):** Utilized for complex, heavy-context debugging and optimization. Analyzed large code snippets (up to 7 files simultaneously) to pinpoint subtle bug root causes and helped optimize the semantic search schema/prompts for maximum retrieval accuracy.

---

## 2. Data Strategy & Data Migration Audit

* **Data Strategy & Schema Alignment:**
  * **Dataset Sanitization:** 
    * Handled raw dataset inconsistencies (e.g., missing purchase dates, invalid device names, unstandardized brand strings).
    * The initial JSON dataset was messy and contained inconsistencies, such as null/empty purchase dates and unstandardized status strings. GPT was used to clean and unify the dataset formatting before feeding it to Gemini to build the seeding algorithm.
  * **Model-Driven Dataset Transformation:** Once SQLAlchemy models were defined, updated the seed dataset structures to directly reference model schemas and Enums (e.g., using `StatusEnum.AVAILABLE` in code) rather than passing unvalidated raw strings like `"status": "Available"`.
  * **Database Evolution & Seeding Logic:**
    * Legacy seed fields (e.g., `"notes": "Battery swelling, do not issue without service."`) were programmatically converted by the seeding script into "Initial Notes" assigned to a generated Admin user account.
    * Expanded the dataset to 50 realistic hardware items to test system performance at scale.
    * Programmatically provisioned two default accounts (1 Admin, 1 Standard User) during seeding, dynamically linking any seeded item with an `"In Use"` status to the standard user's initial rental history.

* **Human Audit — Catching AI Model Oversights:**
  * **Data Corruption Passed Off as "Intentional":** GPT initially refused to fix corrupt entries or typos (e.g., `"Appel"` instead of `"Apple"`, or `"Unknown Device"`), explicitly stating in its output:
    > *"I intentionally did not correct the underlying data issues, only the JSON syntax. The following data problems remain because they appear intentional."*
    
    Human intervention was required to explicitly instruct the AI to sanitize the underlying hardware data rather than preserving corrupted values.
  * **Seeding Algorithm & Relational Overlap:** While writing the initial seeding algorithm, Gemini overlooked the conceptual confusion between the raw `history` string and `notes` field. After pointing out that these strings served redundant/confusing purposes, a refactoring pass unified them into clean notes which sparked the core architectural decision to break history out into distinct, fully typed relational tables (`RentalHistory`, `RepairHistory`, and `Notes`).

---

## 3. Prompt Trail

* Prompt history, architectural discussions, and design decisions are documented separately in [`PROMPTS.md`](./PROMPTS.md).

---

## 4. The "Correction" (AI Hallucinations & Manual Interventions)

Throughout the development cycle, active human oversight was mandatory. AI models rarely provided a fully functional, production-ready solution on the first attempt without requiring simplified prompts, manual bug fixes, or direct code corrections.

* **Auth Fallbacks & Broken Layouts:**
  * **The Prompt:** Instructed Gemini to implement a frontend fetch API for authentication configured to handle secure HTTP-only cookies.
  * **The AI Failure:** Gemini stripped critical parts of the pre-built login page UI during the refactoring process and defaulted to storing JWT tokens in `localStorage` instead of the requested cookie configuration.
  * **The Fix:** Manually restored the corrupted login layout components and refactored the fetch layer to properly handle cookie-based authentication.

* **UI Strategy Drift & Unpaginated Lists:**
  * **Modal turned Dropdown:** Requested a modal/dialog overlay for notifications triggered by a sidebar button press. Gemini generated a nested dropdown menu inside the sidebar button instead.
  * **The Pivot & Secondary Failure:** Due to z-index and clipping issues inside the sidebar container, the strategy shifted to a dedicated Notification Page. However, Gemini rendered all system notifications on a single, endless page without pagination. A follow-up prompt was required to force paginated list rendering.

* **Framework Version Misalignments & Hallucinated Debugging:**
  * **Base UI `asChild` vs. `render`:** Passing the legacy `asChild` prop to UI primitives threw React errors. **Not a single AI model** (Gemini, Claude, or GPT) recognized the breaking change, hallucinating generic advice instead (*"check your imports and ensure the component is installed"*). Manual research through official docs and developer forums revealed that Base UI replaced `asChild` with the `render={...}` prop pattern.
  * **Zod v3 vs. Zod v4 Syntax:** Gemini repeatedly generated validation schemas using Zod v3 syntax despite the project running on Zod v4, requiring manual schema refactoring to fix type syntax errors.

* **Code Skipping & Import Pollution During Refactors:**
  * During multi-file refactoring passes, AI assistants frequently omitted existing business logic or left out necessary code blocks entirely.
  * Assistants regularly polluted component files with unreferenced imports and unused state variables, requiring constant code auditing before committing changes.

* **Synchronous API Bottleneck during Database Seeding:**
  * **The Prompt:** Instructed Gemini to generate vector embeddings for seed hardware items on database initialization.
  * **The AI Failure:** Gemini wrote a synchronous loop that executed live Gemini API network requests *inside* the DB seeding transaction for every single item. If the external Gemini API timed out, failed, or hit rate limits, the entire database initialization aborted—leaving the application completely unseeded.
  * **The Architectural Fix:** Identified the risk of coupling local DB availability to external API stability. Consulted GPT to design an asynchronous background task pipeline, then instructed Gemini to decouple vector indexing into FastAPI `BackgroundTasks`, ensuring DB seeding completes instantly while embeddings index silently in the background.