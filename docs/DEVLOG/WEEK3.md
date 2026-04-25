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

### Current Status

- ✅ Backend: Reflection API, migrations, CORS, Insight Engine all working
- ✅ Frontend: Form scaffold complete, API client wired, data flow end-to-end
- ⏳ Next: Day 7 — cleanup, polish, dead code removal

