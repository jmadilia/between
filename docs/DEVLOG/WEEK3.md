## Week 3

### Frontend Scaffold & Patient UI

- Initialized React + TypeScript frontend with Vite
  - Fast dev server, minimal overhead compared to CRA
  - TypeScript + React 19.2.4 for type safety and latest event model
  - Configured eslint for code quality
- Created `ReflectionForm` component with controlled inputs
  - Textarea for free-text reflection with empathetic placeholder copy
  - Two `<input type="range">` sliders for mood (1–5) and symptom severity (1–5)
  - Real-time value display next to sliders for UX feedback
  - Proper accessibility: wrapped inputs in `<label>` elements
  - Hardcoded `PATIENT_ID = 1` for now (auth layer deferred)

#### React 19 Type System Changes

- React 19 deprecates synthetic event wrappers (`React.FormEvent`, `React.SyntheticEvent`)
- Use native DOM event types instead: `SubmitEvent`, `ChangeEvent`, etc.
- No import needed — these are standard TypeScript DOM types
- This removes abstraction layers and aligns React more with native DOM behavior

### API Client & End-to-End Data Flow

- Created `api.ts` with typed axios client
  - `ReflectionPayload` type matches backend `ReflectionCreate` schema exactly
  - `submitReflection()` sends POST request to `/reflections/`
  - Centralized configuration: `baseURL` from env var `VITE_API_URL`
- Added CORS middleware to FastAPI
  - Allows requests from `http://localhost:5173` (Vite default port)
  - Permits all methods and headers for dev iteration
- Environment configuration
  - Created `frontend/.env` with `VITE_API_URL=http://127.0.0.1:8000`
  - Added `.env` to `.gitignore` and committed `.env.example` instead (matching backend pattern with `alembic.ini`)

### Vertical Slice Complete

- Form submission → API call → database insert → 201 response verified in DevTools Network tab
- Patient can now:
  1. Enter free-text reflection
  2. Select mood and symptom severity
  3. Submit and see confirmation (201 Created)
- This fulfills Days 4–5 of the original plan (Patient UI + Data Flow)

#### Learnings

- React 19 uses native event types — no need for wrapper types from the React namespace
- Vite's env var pattern (`VITE_` prefix) is simpler than webpack env injection
- Axios destructures responses cleanly (`response.data`), reducing boilerplate
- CORS configuration in FastAPI is straightforward (`CORSMiddleware`) but must be added before routers for proper middleware order
- `.env` pattern (gitignore + `.example` template) keeps secrets safe while documenting what config is required

#### Technical Options Weighed

- Frontend framework
  - Considered Next.js (more batteries included, but heavier)
  - Chose React + Vite (lightweight, fast HMR, minimal scaffold)
- State management
  - Considered Redux/Zustand early
  - Kept `useState` for now — single form doesn't justify global state yet
- Form library
  - Installed `react-hook-form` for future use (more complex forms, validation)
  - Current form is simple enough for vanilla controlled inputs
- CORS strategy
  - Considered token-based origin checking
  - Kept simple allow-list for localhost dev (no auth layer yet)

---

### Insight Engine v1

- Built `InsightEngine` class in `app/engine/insight_engine.py`
  - `analyze()` orchestrates all detection methods and returns `{ trends, flags, summary }`
  - `_detect_mood_trend()` — compares average mood of oldest 2 vs newest 2 reflections; flags if newest is 2+ points lower
  - `_detect_engagement()` — checks days since last check-in; flags if >3 days
  - `_detect_keywords()` — scans reflection content for thematic terms (sleep, stress, work, anxiety); flags categories mentioned 2+ times
  - `_build_summary()` — synthesizes trends and flags into a plain-English paragraph
- Created `GET /insights/{patient_id}` endpoint in `routers/insights.py`
  - Queries all reflections for a patient, passes them to `InsightEngine`, returns structured JSON
- Registered insights router in `main.py`

#### Learnings

- `if __name__ == "__main__"` blocks must be at module level, not inside a class body — Python evaluates class-level code at definition time, so `InsightEngine` doesn't exist yet when the block runs
- Keyword detection using `any(term in content for term in terms)` is more flexible than exact matching — catches "stressful", "overwhelmed", etc. under the same category
- Timezone-aware comparisons require `.replace(tzinfo=timezone.utc)` on naive datetimes — mixing naive and aware datetimes raises a TypeError
- Testing engine logic with `SimpleNamespace` mock objects before wiring up the database is a clean way to validate logic in isolation

#### Technical Options Weighed

- Keyword matching strategy
  - Considered regex for more precise matching
  - Kept `in content` substring matching — simpler and sufficient for MVP; can upgrade later
- Engagement threshold
  - Considered dynamic thresholds based on session cadence
  - Hardcoded 3-day threshold for now — easy to parameterize later when real session data exists

---

### Therapist Dashboard — Backend & API Layer (Day 8)

#### User Model Extension

- Added `name: Mapped[str]` and `role: Mapped[UserRole]` fields to `User`
  - `UserRole` is a Python `Enum` mapped to a SQLAlchemy `Enum` column — enforced at the DB level
  - Chose enum over plain string to prevent invalid role values at the schema layer

#### Patients Endpoint

- Created `GET /patients/` in `routers/patients.py`
  - Filters by `UserRole.patient` and returns `id`, `name`, `role` for each user
  - Registered in `main.py` under `/patients` prefix
- Returns explicit dicts rather than ORM objects — avoids serialization issues with `response_model=list[dict]`

#### Seed Data

- Rewrote `init_db.py` to insert test data after `create_all`
  - 1 therapist, 3 patients (Alice, Bob, Carol)
  - 9 reflections distributed across patients with deliberate variation:
    - Alice: declining mood (4 → 2) and stress/sleep/work keywords to trigger insight flags
    - Bob: stable mood with anxiety keywords
    - Carol: low engagement (last check-in 15 days ago) and sleep keywords
  - `db.flush()` used after adding users so their IDs are available before inserting reflections

#### Frontend API Client

- Added `Patient`, `Reflection`, and `Insights` TypeScript types matching backend response shapes
- Added `getPatients()`, `getReflections(patientId)`, `getInsights(patientId)` with typed `Promise<T>` return signatures
  - `getReflections` uses query param: `/reflections/?patient_id={id}`
  - `getInsights` uses path param: `/insights/{id}`

#### Learnings

- `db.flush()` writes to the DB transaction buffer without committing — necessary when you need generated IDs before the session is committed
- SQLAlchemy enum columns compare against enum members (`UserRole.patient`), not plain strings — using a string silently returns no results
- Template literals require `${}` not `{}` for interpolation — static strings with curly braces are silently passed as-is

---

### Therapist Dashboard — Frontend UI (Day 8 continued)

#### Component Architecture

- Built three new components to compose the dashboard:
  - `PatientList` — fetches and renders all patients, accepts `selectedPatientId` and `onSelectPatient` as props, highlights the active patient with `bg-blue-100`
  - `ReflectionCard` — displays a single reflection with formatted date, mood color dot, symptom severity, and content
  - `PatientTimeline` — orchestrates data fetching for reflections and insights when a patient is selected, renders the insights box and reflection list
- `TherapistDashboard` owns `selectedPatientId` state and passes it down — keeps data fetching logic out of the page component

#### Split-View Layout

- Used Tailwind `grid grid-cols-1 lg:grid-cols-4` for responsive layout
  - Patient list takes `lg:col-span-1` with a right border
  - Timeline takes `lg:col-span-3`
  - Both panels scroll independently with `overflow-y-auto`
- Stacks vertically on mobile, splits horizontally on large screens

#### Mood Color System

- Helper function `moodColor(mood)` maps 1–5 to Tailwind bg classes
  - 1 = `bg-red-500`, 2 = `bg-orange-400`, 3 = `bg-yellow-400`, 4 = `bg-lime-400`, 5 = `bg-green-500`
- Rendered as a small dot (`w-3 h-3 rounded-full`) next to the reflection date

#### Data Fetching Pattern

- `PatientTimeline` fetches reflections and insights in parallel using `Promise.all`
- Reflections are sorted newest-first before setting state — sort happens client-side, no backend change needed
- `useEffect` depends on `[patientId]` so the fetch re-runs whenever the selected patient changes
- Loading and empty states handled explicitly

#### Learnings

- `getPatients().then(setPatients)` works without a wrapper because `setPatients` already accepts `Patient[]` — passing a state setter directly into `.then()` is clean when the types align
- Independent scroll panels require `overflow-y-auto` on each column div, not on the outer grid container
- `Promise.all` for parallel fetches is cleaner than sequential `await` calls when the results are independent

---

### Current Status

- ✅ Backend: Reflection API, migrations, CORS, Insight Engine all working
- ✅ Frontend: Form scaffold complete, API client wired, data flow end-to-end
- ✅ Backend: Patients endpoint, User model with roles, seed data all working
- ✅ Frontend: Typed API client extended with patients, reflections, and insights functions
- ✅ Frontend: Split-view therapist dashboard complete — patient list, timeline, insights, mood colors all working
- ✅ Frontend: Mood/severity chart and recent reflection excerpt complete

---

### Trends & Summaries (Day 9)

#### MoodChart Component

- Built `MoodChart` using Recharts `LineChart` with two lines
  - Mood in blue (`#3b82f6`), symptom severity in orange (`#f97316`)
  - Both on the same Y-axis bounded to 1–5 — same scale makes the relationship between metrics immediately readable
  - X-axis shows formatted dates (`"May 3"` style), sorted oldest → newest (chronological, opposite of the reflection list sort)
  - `ResponsiveContainer` with `width="100%"` so the chart fills its parent naturally
  - `Tooltip` and `Legend` included for readability
- Data is transformed from `Reflection[]` inside the component — no new API calls or state needed

#### Recent Reflection Excerpt

- Added to the bottom of the existing insights box in `PatientTimeline`
- Pulls `reflections[0]` which is already sorted newest-first from the `useEffect`
- Displays date and full content in an italic, left-bordered style (`border-l-2 border-gray-300 pl-3`) to visually distinguish it from computed insights
- Guarded by `reflections.length > 0` — doesn't render for patients with no data

#### Layout Order

- Final panel order in `PatientTimeline`: chart → insights box (with excerpt) → individual reflection cards
- Chart and excerpt are both gated on `reflections.length > 0` so empty states stay clean

#### Learnings

- Recharts `ResponsiveContainer` requires a parent with a defined width — placing it inside a flex column div works naturally
- Chart data needs its own sort (ascending) independent of the reflection list sort (descending) — reusing the already-sorted array would render the chart right-to-left
- Pulling `reflections[0]` for the excerpt is safe when the sort is guaranteed in `useEffect` before `setReflections` is called

---

### Current Status

- ✅ Backend: Reflection API, migrations, CORS, Insight Engine all working
- ✅ Frontend: Form scaffold complete, API client wired, data flow end-to-end
- ✅ Backend: Patients endpoint, User model with roles, seed data all working
- ✅ Frontend: Typed API client extended with patients, reflections, and insights functions
- ✅ Frontend: Split-view therapist dashboard complete — patient list, timeline, insights, mood colors all working
- ✅ Frontend: Mood/severity chart and recent reflection excerpt complete
- ✅ Backend: Pydantic response schemas and `response_model` wired to all endpoints
- ✅ Frontend: Type mismatches corrected, all API functions fully typed

---

### Shared Types & Contracts (Day 10)

#### New Pydantic Schemas

- Added `PatientRead` to `core_schemas.py`
  - `id`, `name`, `role` fields
  - `from_attributes = True` — built from SQLAlchemy ORM objects, so Pydantic needs attribute access rather than dict access
- Added `InsightsRead` to `core_schemas.py`
  - `trends: list[str]`, `flags: list[str]`, `summary: str`
  - No `from_attributes` needed — insight engine returns a plain dict, not an ORM object
- Removed unused `ReflectionList` schema — was defined but never imported or used anywhere

#### Response Models Wired

- `GET /patients/` now has `response_model=list[PatientRead]`
  - Can now return ORM objects directly instead of manually building dicts — Pydantic handles serialization
- `GET /insights/{patient_id}` now has `response_model=InsightsRead`
  - FastAPI validates the engine's output shape before sending — malformed responses now surface as a 500 instead of silently reaching the frontend
- All endpoints now appear with accurate response schemas in FastAPI's auto-generated docs at `/docs`

#### Frontend Type Fixes

- `Insights.summary` corrected from `string[]` to `string` — was a live type mismatch with the backend
- `submitReflection` now returns `Promise<Reflection>` instead of `Promise<any>`

#### Learnings

- `from_attributes = True` is required on any Pydantic schema that wraps a SQLAlchemy model — without it, Pydantic tries dict-style access and the serialization fails
- `response_model` on an endpoint does two things: validates outgoing data at runtime, and documents the response shape in `/docs` — both matter
- A type mismatch between backend and frontend (`string` vs `string[]`) won't cause an immediate error if the value is only rendered as text — it silently becomes a bug the moment you try to iterate or call array methods on it

---

### Current Status

- ✅ Backend: Reflection API, migrations, CORS, Insight Engine all working
- ✅ Frontend: Form scaffold complete, API client wired, data flow end-to-end
- ✅ Backend: Patients endpoint, User model with roles, seed data all working
- ✅ Frontend: Typed API client extended with patients, reflections, and insights functions
- ✅ Frontend: Split-view therapist dashboard complete — patient list, timeline, insights, mood colors all working
- ✅ Frontend: Mood/severity chart and recent reflection excerpt complete
- ✅ Backend: Pydantic response schemas and `response_model` wired to all endpoints
- ✅ Frontend: Type mismatches corrected, all API functions fully typed
- ✅ Backend: Auth dependency stubs, role guards, and data isolation complete
- ✅ Docs: SECURITY.md documenting auth model and HIPAA gaps

---

### Security & Healthcare Awareness (Day 11)

#### Auth Dependency Stubs

- Created `backend/app/auth/deps.py` with three FastAPI dependency functions:
  - `get_current_user()` — currently returns a hardcoded user from the DB; structured to be swapped for JWT decoding without changing any downstream code
  - `require_therapist()` — raises HTTP 403 if current user is not a therapist
  - `require_patient()` — raises HTTP 403 if current user is not a patient
- The stub pattern means real auth is a single-function replacement — all role guards and isolation logic stay unchanged

#### Role-Based Access Control

- Every endpoint now has an explicit role guard:
  - `GET /patients/` — therapist only
  - `GET /insights/{patient_id}` — therapist only
  - `POST /reflections/` — patient only
  - `GET /reflections/` — identity-scoped (see below)
- Guards use `_: User = Depends(require_X)` when the user object isn't needed in the function body — signals the dependency is enforced for its side effect only

#### Data Isolation

- `GET /reflections/` performs an identity check beyond role: if the requester is a patient, `current_user.id` must match the requested `patient_id`
- Patients requesting another patient's reflections receive HTTP 403
- Therapists bypass the identity check — cross-patient access is required by design
- This is the HIPAA-critical distinction: role alone isn't sufficient, access must be scoped to identity

#### SECURITY.md

- Added `docs/SECURITY.md` documenting three tiers:
  - What's real now (role guards, data isolation, audit-friendly timestamps)
  - What's stubbed (authentication)
  - What full HIPAA compliance would require (AuditLog table, token expiry, encrypted PHI fields, rate limiting, consent tracking)

#### Learnings

- FastAPI dependencies compose cleanly — `require_therapist` wraps `get_current_user`, so upgrading auth only requires changing the innermost function
- `_` naming for unused dependency return values is a Python convention that signals intent — the dependency runs for its side effect, not its return value
- Role-based access and identity-scoped access are separate concerns — a therapist role check prevents cross-role access, but only an identity check prevents same-role cross-patient access

---

### Current Status

- ✅ Backend: Reflection API, migrations, CORS, Insight Engine all working
- ✅ Frontend: Form scaffold complete, API client wired, data flow end-to-end
- ✅ Backend: Patients endpoint, User model with roles, seed data all working
- ✅ Frontend: Typed API client extended with patients, reflections, and insights functions
- ✅ Frontend: Split-view therapist dashboard complete — patient list, timeline, insights, mood colors all working
- ✅ Frontend: Mood/severity chart and recent reflection excerpt complete
- ✅ Backend: Pydantic response schemas and `response_model` wired to all endpoints
- ✅ Frontend: Type mismatches corrected, all API functions fully typed
- ✅ Backend: Auth dependency stubs, role guards, and data isolation complete
- ✅ Docs: SECURITY.md documenting auth model and HIPAA gaps
- ⏳ Next: Day 12 — Demo polish, patient form styling, loading/success states

