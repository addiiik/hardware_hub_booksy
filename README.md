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

4. Start the FastAPI development server:

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

2. Install the JavaScript dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

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