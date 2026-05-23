## Week 6

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
- ✅ Frontend: Insight window selector — Week/Month/Year/All
- ✅ Seed data: Realistic therapist notes for all three patients, timed to complement reflection arcs
- ✅ Frontend: On-demand AI insight generation — Generate button, empty state, Regenerate button
- ✅ Backend: SOAPNote model, AI draft generation, save, and list endpoints
- ✅ Frontend: SOAP note form with AI generation, manual entry, and review flow
- ✅ Frontend: SOAP notes section with expandable note history in therapist dashboard
- ✅ Frontend: Note export — TXT and PDF for session notes (bulk) and SOAP notes (per-note)
- ✅ Backend: DAPNote model, AI draft generation, save, and list endpoints
- ✅ Frontend: DAP note form with AI generation, manual entry, and review flow
- ✅ Frontend: Documentation tab — SOAP/DAP type selector, only selected format shown at a time

---

### Day 18 — DAP Notes Model + API

#### Why DAP notes

DAP (Data, Assessment, Plan) is a common alternative to SOAP used across many practices and supervision contexts. The key structural difference: DAP collapses SOAP's Subjective and Objective sections into a single Data section that integrates both patient-reported content and clinician observations into one unified account. Some clinicians find this more natural — rather than separating "what the patient said" from "what I observed," they write a coherent clinical picture that weaves both together.

Supporting DAP alongside SOAP means Between is usable by practices regardless of which format they standardize on, rather than requiring therapists to adapt their documentation workflow to the app.

#### DAPNote model

- New `DAPNote` model in `app/models/dap_note.py`: `id`, `patient_id`, `therapist_id`, `session_date`, `data`, `assessment`, `plan`, `created_at`
- Three `Text` columns map directly to DAP format — `data` is intentionally broader than either SOAP's Subjective or Objective alone
- Same auth pattern as `SOAPNote` and `TherapistNote`: `therapist_id` stamped from `current_user`, never trusted from the client

#### AI generation

- `app/engine/ai_dap.py` — `generate_dap_draft()` builds a prompt that instructs Claude to integrate patient-reported reflections and quantitative mood/severity data into a single coherent Data section, rather than separating them
- Prompt explicitly guides Claude to weave self-report and observation together — this is the clinical distinction that makes DAP feel different from SOAP in practice
- Same error handling pattern as `ai_soap.py`: raises 503 if no API key, 502 on generation failure or malformed JSON

#### API endpoints

- `POST /dap-notes/generate` — AI draft, no DB write
- `POST /dap-notes/` — saves therapist-reviewed note
- `GET /dap-notes/?patient_id=` — returns notes ordered newest session date first

#### Learnings

- The SOAP → DAP adaptation required more than just removing one field — the prompt for Data had to explicitly instruct Claude to integrate rather than separate, otherwise it would produce a Subjective-flavored paragraph and ignore the objective data
- Keeping `ai_soap.py` and `ai_dap.py` as separate modules (rather than parameterizing one function) keeps each prompt self-contained and independently tunable — the formats are similar enough to tempt consolidation but different enough that a shared prompt would become a mess of conditionals

---

### Day 19 — Frontend: Documentation Tab + DAP Note UI

#### Consolidating formal documentation under one tab

The previous design gave SOAP notes their own tab ("SOAP Notes"). Adding DAP notes as a second tab would have pushed the tab bar to five items and confronted every therapist with a tab for a note type their practice may not use. The better model: one "Documentation" tab that surfaces whichever format the therapist selects.

#### DocumentationTab component

- Segmented control (SOAP / DAP) sits at the top of the Documentation tab — same visual pattern as the insight window selector
- Only the selected section renders below it — `SOAPNotesSection` or `DAPNotesSection`, not both
- Defaults to SOAP on mount; switching note type does not reset state within either section (each section mounts/unmounts independently, preserving form state within the active view)
- The "SOAP Notes" tab in `PatientTimeline` was renamed "Documentation" and now renders `DocumentationTab` — tab count stays at four

#### DAPNoteForm and DAPNotesSection

- `DAPNoteForm` — three labeled textareas (Data, Assessment, Plan), session date picker, AI generate/regenerate, and save; mirrors `SOAPNoteForm` structurally
- `DAPNotesSection` — list of past DAP notes with date, truncated Data preview, expand/collapse, and per-note TXT/PDF export buttons in the expanded view
- Export functions `exportDAPAsTxt` and `exportDAPAsPdf` added to `export.ts` — same PDF layout pattern as SOAP

#### Learnings

- A format selector within a single tab scales better than one tab per format — each new note type added to the selector costs one button, not one tab
- Defaulting to SOAP is the right call for now since it's the more universally recognized format; this default should be configurable per practice if the app grows toward multi-tenant support
