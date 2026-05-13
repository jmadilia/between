# Between

Between is a between-session reflection platform that helps patients track mood, symptoms, and goals, while providing therapists with AI-generated summaries and session notes to guide care.

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

- **AI-generated pre-session summaries** synthesize patient reflections and session notes into a clinical narrative
- **Session notes** let therapists log observations after each visit, creating a two-sided record
- **Time-windowed insights** — pull a weekly check-in, monthly progress snapshot, or full-history summary on demand
- **Mood trends** highlight patterns and changes over time
- **Engagement tracking** flags missed reflections
- **Keyword detection** surfaces recurring stress factors (sleep, work, anxiety)

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
- Session notes — log observations after each visit
- AI-generated pre-session summary (Claude `opus-4-7`) with:
  - Clinical narrative synthesized from patient reflections and therapist notes
  - Key mood/symptom trends
  - Engagement status
  - Notable keywords and themes
- Time-windowed insights: Week / Month / Year / All time

---

## Project Structure

```
between/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration, auth stubs
│   │   ├── db/            # Database session, initialization
│   │   ├── models/        # SQLAlchemy ORM models (User, Reflection, TherapistNote)
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── engine/        # Insight generation (rule-based + AI summary)
│   │   │   ├── insight_engine.py  # Deterministic mood/engagement/keyword analysis
│   │   │   └── ai_summary.py      # Claude API integration for clinical narratives
│   │   └── main.py        # FastAPI app setup and routing
│   ├── routers/           # API endpoint handlers
│   ├── alembic/           # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page-level components (patient form, therapist dashboard)
│   │   ├── api.ts         # Typed API client
│   │   └── App.tsx        # Routing, layout, and theme
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
   # Edit .env with your credentials:
   # DATABASE_URL=postgresql://user:password@localhost/between
   # ANTHROPIC_API_KEY=sk-ant-...   (required for AI-generated summaries)
   ```

3. **Initialize database and seed data:**

   ```bash
   python -m alembic upgrade head
   python app/db/init_db.py
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

- `POST /reflections` — Submit a new reflection (patient only)
  - Body: `{ patient_id, mood, symptom_severity, content }`
  - Returns: Created reflection object

- `GET /reflections?patient_id=<id>` — Retrieve patient's reflection history
  - Returns: Array of reflection objects

### Patients

- `GET /patients` — List all patients (therapist only)
  - Returns: Array of patient objects

### Notes

- `POST /notes` — Create a therapist session note (therapist only)
  - Body: `{ patient_id, content, session_date }`
  - Returns: Created note object

- `GET /notes?patient_id=<id>` — Retrieve session notes for a patient (therapist only)
  - Returns: Array of note objects

### Insights

- `GET /insights/{patient_id}?window=week|month|year|all` — Get AI-generated insights for a patient (therapist only)
  - Filters reflections and therapist notes by the selected time window
  - Returns: `{ trends, flags, summary }` — rule-based signals + AI clinical narrative

### Health

- `GET /health` — Service health check

---

## Tech Stack

### Frontend

- React 19 with TypeScript
- Vite (build tool)
- Tailwind CSS v4 (Peachy Fog design system, light/dark mode)
- Recharts (mood/severity trend chart)
- React Router v6

### Backend

- FastAPI (Python)
- PostgreSQL (database)
- SQLAlchemy (ORM)
- Pydantic (validation)
- Alembic (migrations)
- Anthropic Python SDK (Claude `opus-4-7` for AI summaries)

---

## Design Principles

- **Hybrid intelligence:** Rule-based signals (mood trends, engagement, keyword flags) are deterministic and auditable. Claude synthesizes them into a clinical narrative — it explains patterns, it doesn't diagnose.
- **Two-sided context:** Therapist notes and patient reflections are kept separate and combined only at insight-generation time, so each record is clean and role-appropriate.
- **Healthcare-aware:** Data isolation, role-based access, audit-friendly structure throughout.
- **Simple & focused:** No scheduling, messaging, or notifications in MVP.
- **Patient-first:** Empathetic UX, clear language, minimal friction.

---

## Scope Lock

### Out of Scope (for now)

- Scheduling
- Messaging
- Notifications
- HIPAA certification claims
- Diagnosis or treatment recommendations
- AI acting as a therapist or giving clinical advice

---

## Development

See `docs/PLAN.md` for the week-by-week development roadmap.
See `docs/DEVLOG/` for detailed progress notes.

