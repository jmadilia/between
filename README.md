# Between

Between is a between-session reflection platform for mental health care. Patients log mood, symptoms, and reflections between sessions. Therapists get AI-generated pre-session briefs, structured clinical documentation, and exportable records — so they spend less time catching up and more time treating.

## Try the Demo

The deployed app opens on a landing page with no sign-up. Pick a role:

- **Explore as the therapist** — opens Dr. Sarah Okonkwo's dashboard with a three-patient caseload, mood charts, session notes, and seeded SOAP/DAP notes.
- **Check in as a patient** — submit a reflection as Alice, Bob, or Carol, then jump to the therapist view to see it land in their timeline and brief.
- **Start as a new patient** — walk through intake (profile, PHQ-9, GAD-7, consent) as a brand-new patient.

Everything is stored in Postgres, so it persists across visits. **Reset demo** in the top bar restores the original caseload.

---

## What It Does

### For Patients
- Submit between-session reflections: mood (1–5), symptom severity (1–5), free-text note
- View personal reflection history

### For Therapists
- **Split-view dashboard** — patient list alongside a tabbed detail panel (Overview, Reflections, Notes, Documentation)
- **AI pre-session brief** — Claude synthesizes patient reflections, session notes, and formal clinical documentation from a selected date range into a 2–4 sentence clinical narrative
- **Mood trend chart** — Recharts visualization of mood and severity over time
- **Session notes** — informal, free-text observations tied to a session date
- **SOAP notes** — AI-drafted or manually written; Subjective, Objective, Assessment, Plan
- **DAP notes** — AI-drafted or manually written; Data, Assessment, Plan
- **Documentation tab** — SOAP/DAP type selector so practices that use only one format aren't confronted with the other
- **Note export** — session notes as bulk TXT/PDF; SOAP and DAP notes as per-note TXT/PDF
- **Engagement signals** — keyword detection, mood trends, and engagement flags surface automatically in the pre-session brief

---

## Tech Stack

### Backend
- **FastAPI** (Python) — async API with role-based auth dependency injection
- **PostgreSQL** + **SQLAlchemy** ORM with typed `Mapped` columns
- **Pydantic v2** — request/response schemas with `response_model` on every endpoint
- **Anthropic Python SDK** — Claude `claude-opus-4-7` for pre-session briefs, SOAP drafts, and DAP drafts

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** with a custom `@theme` design system (Peachy Fog palette)
- **Recharts** — mood/severity trend visualization
- **React Router v6**
- **jsPDF** — client-side PDF export with no server round-trip
- **Axios** — typed API client

---

## Architecture Highlights

**Hybrid intelligence.** The insight engine runs two layers: a deterministic rule-based pass (mood trend direction, engagement gap detection, keyword frequency) followed by a Claude API call that synthesizes those signals into a clinical narrative. Rule-based signals are always computed; Claude adds the narrative layer on top. If the API key is absent or the call fails, the endpoint falls back to the rule-based summary rather than erroring.

**Two-sided clinical record.** Patient reflections and therapist documentation (session notes, SOAP, DAP) are stored separately and combined only at insight-generation time. Each record type is role-gated at the API level — patients cannot read therapist notes, therapists cannot submit reflections on behalf of patients.

**AI draft, human save.** The SOAP and DAP generation endpoints (`POST /soap-notes/generate`, `POST /dap-notes/generate`) return a draft and never write to the database. The therapist reviews and edits, then calls a separate save endpoint. This boundary is intentional: AI output is never committed as a medical record without explicit clinician sign-off.

**Full clinical context in the brief.** The pre-session insight endpoint queries all four data sources within the selected date range — patient reflections, informal session notes, SOAP notes, and DAP notes — and passes them all to Claude. Prior assessments and treatment plans from formal documentation are surfaced in the brief, not just self-reports.

---

## Project Structure

```
between/
├── backend/
│   ├── app/
│   │   ├── core/               # Settings, config
│   │   ├── db/                 # Engine/session, demo seed + bootstrap (seed.py)
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── user.py         # User with role enum (patient / therapist)
│   │   │   ├── reflection.py
│   │   │   ├── therapist_note.py
│   │   │   ├── soap_note.py
│   │   │   └── dap_note.py
│   │   ├── schemas/
│   │   │   └── core_schemas.py # All Pydantic request/response types
│   │   ├── engine/
│   │   │   ├── insight_engine.py  # Rule-based trend/flag/engagement analysis
│   │   │   ├── ai_summary.py      # Pre-session brief via Claude
│   │   │   ├── ai_soap.py         # SOAP draft generation via Claude
│   │   │   └── ai_dap.py          # DAP draft generation via Claude
│   │   └── main.py
│   ├── routers/
│   │   ├── reflections.py
│   │   ├── insights.py
│   │   ├── patients.py
│   │   ├── notes.py
│   │   ├── soap_notes.py
│   │   ├── dap_notes.py
│   │   ├── onboarding.py
│   │   └── demo.py             # Personas, new demo patient, reset
│   ├── tests/                  # API tests (SQLite by default, Postgres via TEST_DATABASE_URL)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # ReflectionCard, MoodChart, SessionNotes,
│   │   │   │                   # SOAPNoteForm, DAPNoteForm, DocumentationTab, ...
│   │   ├── pages/              # Landing, TherapistDashboard, OnboardingFlow
│   │   ├── utils/
│   │   │   └── export.ts       # TXT and PDF export for all note types
│   │   ├── api.ts              # Fully typed Axios client
│   │   └── App.tsx
│   └── package.json
└── docs/
    ├── DEVLOG/                 # Week-by-week engineering notes
    └── SECURITY.md             # Auth model and known HIPAA gaps
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (local, or a free Neon database)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # then set DATABASE_URL (and optionally ANTHROPIC_API_KEY)
python -m uvicorn app.main:app --reload
```

On first request against an empty database the API creates the tables and loads the demo data, so there is no separate init step. To wipe the database back to the demo state at any time:

```bash
python -m app.db.init_db
```

API runs at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

Run the tests (SQLite by default; set `TEST_DATABASE_URL` to run against Postgres):

```bash
pip install pytest httpx
python -m pytest tests
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. The dev server proxies `/api/*` to the backend on port 8000, mirroring the Vercel setup, so no `.env` is needed.

### Environment Variables (backend)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Postgres URL. `postgres://` URLs from Neon/Vercel are accepted. `POSTGRES_URL` works too. |
| `ANTHROPIC_API_KEY` | No | Enables AI briefs and SOAP/DAP drafting. Without it, briefs fall back to the rule-based summary. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-opus-4-7`. |
| `CORS_ORIGINS` | No | Comma-separated. Only needed if the frontend is served from a different origin. |
| `AUTO_SEED` | No | Default `true`. Creates tables and loads demo data when the database has no users. |

---

## Deploying to Vercel

`vercel.json` deploys the backend and frontend as two services on one domain, with `/api/*` routed to FastAPI. The backend accepts paths with or without the `/api` prefix, and the frontend calls `/api` by default.

1. Connect the Neon integration to the Vercel project (Storage → Neon). It sets `DATABASE_URL` automatically.
2. Add `ANTHROPIC_API_KEY` in Project Settings → Environment Variables if you want live AI output.
3. Leave `VITE_API_URL` unset.
4. Deploy. The first request creates the schema and loads the demo caseload.

---

## API Reference

### Reflections
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reflections/` | Submit a reflection (patient) |
| `GET` | `/reflections/?patient_id=` | Reflection history for a patient |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/patients/` | List all patients (therapist only) |

### Session Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/notes/` | Create a session note (therapist only) |
| `GET` | `/notes/?patient_id=` | Notes for a patient |

### Insights
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/insights/{patient_id}?from_date=YYYY-MM-DD` | AI pre-session brief from a date through today |

### SOAP Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/soap-notes/generate` | Generate AI draft (no DB write) |
| `POST` | `/soap-notes/` | Save reviewed note |
| `GET` | `/soap-notes/?patient_id=` | SOAP note history |

### DAP Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/dap-notes/generate` | Generate AI draft (no DB write) |
| `POST` | `/dap-notes/` | Save reviewed note |
| `GET` | `/dap-notes/?patient_id=` | DAP note history |

### Demo
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/demo/personas` | Therapist and patients a visitor can act as |
| `POST` | `/demo/patients` | Create a fresh patient for the onboarding walkthrough |
| `POST` | `/demo/reset` | Restore the original demo dataset |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |

---

## Seed Data

The seed (`backend/app/db/seed.py`) creates three demo patients with distinct clinical narratives — useful for demonstrating the AI engine across different scenarios:

- **Alice Johnson** — declining mood arc, escalating work stress, sleep disruption
- **Bob Smith** — recovery arc, behavioral activation working, anxiety reducing
- **Carol Rivera** — disengagement risk, severe fatigue, last check-in 15+ days ago

Each patient has reflection history, therapist session notes, a completed intake (profile, PHQ-9, GAD-7), and enough temporal spread that the date-range filter on the pre-session brief produces meaningfully different summaries.

---

## Design Decisions

**Why rule-based signals before Claude?** Deterministic signals (engagement gap, mood trend direction, keyword frequency) are always computable and auditable. Claude is expensive and fallible — the rule layer ensures the endpoint always returns something useful even without an API key.

**Why no auto-save on AI drafts?** Clinical documentation is a legal record. The generate endpoint exists specifically to prevent AI output from being committed without explicit therapist review. The two-step flow (generate → review → save) is a deliberate product boundary, not a convenience feature.

**Why a date picker instead of preset windows?** Therapists don't think in "last 30 days" — they think in "since our last session on May 12th." A free date input maps to that mental model. The preset windows (Week/Month/Year) optimized for speed at the cost of precision.

**Why separate SOAP and DAP rather than one configurable note type?** The formats have different clinical semantics, not just different field counts. DAP's Data section integrates subjective and objective into a unified account — the AI prompt, the field descriptions, and the clinical guidance are all different. Sharing a model would conflate them.

---

## Production Readiness and HIPAA

**This project is a working prototype, not a HIPAA-compliant clinical product.**

Mental health records are Protected Health Information (PHI) under HIPAA. Deploying Between to a real clinical practice requires significant additional work before any patient data can be handled:

- **Authentication** — auth is currently stubbed; the visitor's chosen persona is sent as an `X-Demo-User-Id` header and trusted as-is. A real deployment needs proper credential management, session handling, and MFA support.
- **HIPAA-compliant infrastructure** — hosting providers must sign a Business Associate Agreement (BAA). Railway and Vercel will not. AWS, Google Cloud, and Aptible will.
- **BAA with Anthropic** — patient data is sent to Claude for summary generation. Anthropic offers a BAA under their enterprise tier, which is required before any PHI can be processed.
- **Audit logging** — HIPAA requires a tamper-evident record of who accessed what PHI and when. Nothing in the current codebase implements this.
- **Multi-tenancy** — the data model has no practice-level isolation. A production system needs a `practice_id` on every record so multiple organizations can share infrastructure safely.

See [`docs/SECURITY.md`](docs/SECURITY.md) for a detailed breakdown of the current auth model and known gaps.

---

## Development Notes

Week-by-week engineering decisions, architecture notes, and learnings are in [`docs/DEVLOG/`](docs/DEVLOG/).
