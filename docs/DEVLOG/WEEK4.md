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
- ✅ Frontend: Peachy Fog design system — consistent light and dark mode across all components
- ✅ Frontend: Persistent dark mode toggle with system preference fallback
- ✅ Frontend: NavLink active states, sidebar label, flex layout structure
