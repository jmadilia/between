## Week 7

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
- ✅ Frontend: Pre-session summary uses a "from date" picker instead of preset windows
- ✅ Backend: Pre-session insight engine incorporates SOAP and DAP notes alongside reflections and session notes
- ⬜ Backend: Real JWT authentication — password hashing, token issuance, protected routes
- ⬜ Backend: Audit log model and middleware — PHI access recorded per request
- ⬜ Backend: Therapist-patient assignment model — therapists scoped to their own caseload
- ⬜ Backend: PHI guard on AI features — gate SOAP/DAP generation until BAA is in place
- ⬜ Backend: Soft deletes on all PHI-bearing models — records archived, never hard-deleted
- ⬜ Backend: Rate limiting on auth routes — brute-force protection
- ⬜ Frontend: Inactivity timeout — automatic session logoff after idle period
- ⬜ Infrastructure: HIPAA-eligible hosting — migrate from Railway/Vercel to AWS with BAA

---
