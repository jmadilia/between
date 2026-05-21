## Week 4

### Day 12 — Demo Polish

#### Peachy Fog Design System

- Deleted `App.css` entirely — 100% Vite scaffold, nothing used by the app
- Rewrote `index.css` down to essentials:
  - `@import "tailwindcss"`
  - `@custom-variant dark (&:where(.dark, .dark *))` — switches Tailwind's dark variant from `prefers-color-scheme` media query to class-based, required for manual toggle
  - `@theme` block defining five Peachy Fog tokens: `fog-50` (#ffddba), `fog-200` (#d9ae8e), `fog-400` (#9f8d8d), `fog-700` (#4e4c4f), `fog-900` (#232220)
  - Body reset and font smoothing — nothing else
  - Removed: purple CSS variables, `color-scheme: light dark` (was triggering browser gray dark mode that clashed with Tailwind), `#root` width/center constraint, global h1/h2 overrides
- Applied Peachy Fog palette across all components — light and dark mode
  - Light: `fog-50` page bg, `white` card surfaces, `fog-900` primary text, `fog-400` muted text, `fog-200` borders
  - Dark: `fog-900` page bg, `fog-700` card surfaces, `fog-50` primary text, `fog-400` muted text, `fog-700` borders
  - Interactive/accent: `fog-700` bg with `fog-50` text in light; `fog-200` bg with `fog-900` text in dark
- Updated `MoodChart` to detect dark mode via `MutationObserver` on `document.documentElement` instead of `matchMedia`
  - Required because dark mode is now controlled by class, not system preference
  - Watches for class attribute changes on `<html>` — responsive without a page reload
  - Chart grid: `fog-200` (#d9ae8e) in light, `fog-700` (#4e4c4f) in dark
  - Axis ticks: `fog-700` (#4e4c4f) in light, `fog-400` (#9f8d8d) in dark

#### Dark Mode Toggle

- Added persistent dark mode toggle to footer (sun/moon icon button)
- `isDark` state in `App.tsx` initialized from `localStorage` with `prefers-color-scheme` as fallback
- `useEffect` applies `dark` class to `document.documentElement` and writes to `localStorage` on every change
- Toggle is a circular bordered button: ☀️ in light mode, 🌙 in dark mode
- Footer sits below all page content inside a flex-column layout wrapper

#### Layout Structure

- Wrapped app in `min-h-screen flex flex-col` — gives nav, main, and footer their proper vertical positions
- `TherapistDashboard` changed from `h-screen` to `flex-1 min-h-0 overflow-hidden` — fills the remaining space between nav and footer, panels scroll independently
- `ReflectionForm` outer div changed from `min-h-screen` to `flex-1` — centers the card in the available space
- `<main>` uses `flex-1 flex flex-col min-h-0` — `min-h-0` is required to allow flex children to shrink and scroll properly

#### Nav Polish

- Replaced `Link` with `NavLink` from react-router-dom
  - Active route gets `font-medium` and full-contrast fog text
  - Inactive routes stay muted with hover transition
- Added `Patients` label above the patient list in `PatientList` — context for the sidebar that previously had none

#### Type Fix

- `ReflectionForm.handleSubmit` updated from `SubmitEvent` (non-generic DOM type) to `SubmitEvent<HTMLFormElement>` (React 19 generic) imported from `"react"`
  - React 19's `onSubmit` handler passes `SubmitEvent<HTMLFormElement>`, not the bare DOM `SubmitEvent`
  - `FormEvent` is deprecated in React 19 — native event types are now preferred

#### Backend Fix

- Corrected `details` typo to `detail` in `require_patient` HTTPException in `auth/deps.py`
  - Was causing a 500 on POST /reflections/ in testing — FastAPI raises on unexpected kwargs

#### Learnings

- `color-scheme: light dark` in CSS opts the browser into its own dark mode for native elements (scrollbars, form controls) — removing it gives full control back to Tailwind
- `@custom-variant dark (&:where(.dark, .dark *))` overrides Tailwind v4's built-in dark variant from media-query-based to class-based — one line, no JS config needed
- `MutationObserver` on `document.documentElement` is the right tool for reacting to class changes in JS — more reliable than polling and works across any code path that toggles the class
- `min-h-0` on flex children is required when you want them to scroll internally rather than overflow their container — without it, flex children expand to fit content and the outer container scrolls instead
- `classList.toggle(class, force)` with a boolean is cleaner than separate `add`/`remove` calls for state-driven class toggling

---

---

### Day 13 — TherapistNote Model + Notes API

#### TherapistNote Model

- Created `app/models/therapist_note.py` with fields: `id`, `patient_id`, `therapist_id`, `content`, `session_date` (Date), `created_at` (DateTime with timezone)
  - `session_date` uses SQLAlchemy `Date` type — therapist records the date of the session, not just when they typed the note
  - `therapist_id` is stamped server-side from the auth dependency, never trusted from the client
- Registered model import in `alembic/env.py` and `init_db.py` so `create_all` and autogenerate both see it

#### Schemas

- Added `NoteCreate` — `patient_id`, `content`, `session_date`; `therapist_id` is excluded since it comes from auth
- Added `NoteRead` — full note shape including `therapist_id` and both timestamps; `from_attributes = True` for ORM serialization

#### Notes API

- `POST /notes/` — validates patient exists and holds `UserRole.patient`, stamps `therapist_id` from `current_user`, returns `NoteRead`; therapist-only
- `GET /notes/?patient_id=` — returns notes ordered newest session date first; therapist-only
- Both endpoints guarded by `require_therapist` dependency
- Router registered in `main.py` under `/notes` prefix

#### Learnings

- `session_date` and `created_at` serve different purposes: `session_date` is the clinical record date (when the session happened), `created_at` is the system audit timestamp (when the note was entered) — keeping both matters for healthcare data
- Stamping `therapist_id` from the auth dependency rather than accepting it in the request body is the correct pattern — clients should never be able to claim ownership of records

---

### Day 14 — Time-Windowed AI Insights

#### Window Filtering

- Added `?window=week|month|year|all` query param to `GET /insights/{patient_id}` using `Literal` type for FastAPI validation
- Computed a `since` cutoff datetime from a `_WINDOW_DAYS` lookup dict (`week=7`, `month=30`, `year=365`, `all=None`)
- Reflections filtered by `created_at >= since`, therapist notes filtered by `session_date >= since.date()`
- Rule-based `InsightEngine` runs on the already-filtered reflections — mood trend, engagement, and keyword detection all naturally respect the selected window
- Defaults to `"all"` so existing calls without the param are unaffected

#### AI Prompt Update

- Added `notes: list` parameter to `generate_ai_summary`
- Added `_format_notes()` helper — formats up to 10 notes as `[YYYY-MM-DD] content` lines, oldest to newest
- Notes section is conditionally appended to the Claude prompt only when notes exist — no empty section cluttering short prompts
- Claude now synthesizes both the patient's self-reported reflections and the therapist's clinical observations into a single narrative, giving it genuine two-sided context

#### Learnings

- Separating the window cutoff computation into a `_WINDOW_DAYS` dict keeps the endpoint handler clean — one lookup, no if/elif chains
- Filtering notes by `session_date` (a `Date`) against `since.date()` (stripping the time component) is required — comparing a `Date` column against a full `datetime` raises a type mismatch in SQLAlchemy

---

### Day 15 — Frontend: Session Notes + Time Window Selector

#### SessionNotes Component

- New `session-notes.tsx` component — self-contained, takes only `patientId` as a prop
- Date picker input defaulting to today (`new Date().toISOString().split("T")[0]`) — therapist can backdate if entering notes after the fact
- Textarea + "Save Note" button; button disabled while saving or when content is empty
- On save, new note is prepended to local state — no refetch needed
- Notes history renders below the form, newest first, with session date and left-bordered content

#### PatientTimeline Refactor

- Split the single `Promise.all` fetch into two independent `useEffect`s:
  - Reflections: runs once on `patientId` change — always fetches full history, no window filter
  - Insights: runs on `patientId` or `window` change — re-fetches and clears stale insights while loading
- Added `Week / Month / Year / All` button group above the insights panel — active button uses fog accent colors, inactive buttons stay muted
- Insights panel shows "Generating insights..." while the AI call is in flight
- Mood chart and reflection card list remain unfiltered — always show full history regardless of window

#### API Client

- Added `Note` type, `NotePayload`, `InsightWindow` union type
- Added `getNotes(patientId)` and `createNote(data)` functions
- `getInsights` updated to accept optional `window: InsightWindow` param, defaults to `"all"`

#### Learnings

- Splitting fetches into separate `useEffect`s with different dependency arrays is the right pattern when two pieces of state have different refresh triggers — coupling them in a single `Promise.all` would force reflections to re-fetch every time the window changes
- `toISOString().split("T")[0]` is the simplest way to get today's date in `YYYY-MM-DD` format for an HTML date input without importing a date library
- Prepending to local state on successful save (`[note, ...prev]`) gives instant UI feedback without a round-trip re-fetch

---

### Current Status

- ✅ Backend: Reflection API, migrations, CORS, Insight Engine all working
- ✅ Frontend: Form scaffold complete, API client wired, data flow end-to-end
- ✅ Backend: Patients endpoint, User model with roles, seed data all working
- ✅ Frontend: Typed API client extended with patients, reflections, insights, and notes functions
- ✅ Frontend: Split-view therapist dashboard complete — patient list, timeline, insights, mood colors all working
- ✅ Frontend: Mood/severity chart and recent reflection excerpt complete
- ✅ Backend: Pydantic response schemas and `response_model` wired to all endpoints
- ✅ Frontend: Type mismatches corrected, all API functions fully typed
- ✅ Backend: Auth dependency stubs, role guards, and data isolation complete
- ✅ Docs: SECURITY.md documenting auth model and HIPAA gaps
- ✅ Frontend: Peachy Fog design system — consistent light and dark mode across all components
- ✅ Frontend: Persistent dark mode toggle with system preference fallback
- ✅ Frontend: NavLink active states, sidebar label, flex layout structure
- ✅ Backend: Claude API integration — AI-generated pre-session summaries with rule-based fallback
- ✅ Backend: TherapistNote model, POST /notes, GET /notes — therapist-only, therapist_id stamped from auth
- ✅ Backend: Time-windowed insights — ?window=week|month|year|all filters reflections and notes
- ✅ Frontend: Session notes entry with date picker, save, and history list
- ✅ Frontend: Insight window selector — Week/Month/Year/All re-fetches independently from reflections
