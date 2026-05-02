# Between

Between is a between-session reflection platform that helps patients track mood, symptoms, and goals, while providing therapists with concise, explainable summaries to guide care.

## Problem & Solution

### The Problem

Therapy sessions are limited in time. The most important context is often lost between visits. Patients struggle to reflect consistently between sessions. Therapists lack structured insight into how patients are doing outside of regular visits.

### The Solution

Between bridges that gap. Patients submit quick reflections (mood, symptoms, free-text notes) between sessions. Therapists receive structured, explainable insights to understand trends and spot issues before the next session—so they can spend less time catching up and more time treating.

---

## Users & Core Value

### For Patients

- **Reflection** between sessions builds awareness and better session preparation
- Track **mood trends** and **symptom severity** over time
- Prepare **concrete examples** for therapist discussions

### For Therapists

- **Pre-session summaries** provide quick understanding of patient status
- **Mood trends** highlight patterns and changes
- **Engagement tracking** flags missed reflections
- **Keyword detection** surfaces stress factors (sleep, work, anxiety)

---

## MVP Feature Set

### Patient Features

- Submit reflection with:
  - Mood (1–5 scale)
  - Symptom severity (1–5 scale)
  - Free-text reflection
- View reflection history

### Therapist Features

- Patient timeline (list of reflections)
- Mood trend visualization
- Auto-generated pre-session summary with:
  - Key mood/symptom trends
  - Engagement status
  - Notable keywords and themes

---

## Project Structure

```
between/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration, auth stubs
│   │   ├── db/            # Database session, initialization
│   │   ├── models/        # SQLAlchemy ORM models (User, Reflection, etc.)
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── engine/        # Insight generation (rule-based logic)
│   │   └── main.py        # FastAPI app setup and routing
│   ├── routers/           # API endpoint handlers
│   ├── alembic/           # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page-level components (patient form, therapist dashboard)
│   │   └── App.tsx        # Routing and layout
│   └── package.json
└── docs/                  # Dev logs and planning
```

---

## Getting Started

### Backend Setup

1. **Install dependencies:**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection string
   # DATABASE_URL=postgresql://user:password@localhost/between
   ```

3. **Initialize database:**

   ```bash
   python -m alembic upgrade head
   ```

4. **Run the server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

   - API available at `http://localhost:8000`
   - Docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Run dev server:**
   ```bash
   npm run dev
   ```

   - Available at `http://localhost:5173`

---

## API Endpoints

### Reflections

- `POST /reflections` — Submit a new reflection
  - Body: `{ patient_id, mood, symptom_severity, text }`
  - Returns: Created reflection object

- `GET /reflections?patient_id=<id>` — Retrieve patient's reflection history
  - Returns: Array of reflection objects

### Insights

- `GET /insights/{patient_id}` — Get AI-generated insights for a patient
  - Returns: Insight summary with mood trends, flags, keywords

### Health

- `GET /health` — Service health check

---

## Tech Stack

### Frontend

- React 18+ with TypeScript
- Vite (build tool)
- Accessible form controls
- Minimal styling

### Backend

- FastAPI (Python)
- PostgreSQL (database)
- SQLAlchemy (ORM)
- Pydantic (validation)
- Alembic (migrations)

---

## Design Principles

- **Rule-based intelligence:** Insights are deterministic and explainable, never AI-generated therapy advice
- **Healthcare-aware:** Data isolation, role-based access, audit-friendly structure
- **Simple & focused:** No scheduling, messaging, or notifications in MVP
- **Patient-first:** Empathetic UX, clear language, minimal friction

---

## Scope Lock

### Out of Scope (for now)

- Scheduling
- Messaging
- Notifications
- HIPAA certification claims
- Diagnosis or treatment recommendations
- AI-generated therapy advice

---

## Development

See `docs/PLAN.md` for the week-by-week development roadmap.
See `docs/DEVLOG/` for detailed progress notes.

