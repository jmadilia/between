## Week 8

### Current Status

- ✅ Backend: PatientProfile model — DOB, pronouns, emergency contact, presenting concerns, goals, consent/completion flags
- ✅ Backend: OnboardingScreener model — PHQ-9 and GAD-7 responses, computed score, severity label, crisis flag
- ✅ Backend: Alembic migration for `patient_profiles` and `onboarding_screeners` tables
- ✅ Backend: Onboarding router — status check, profile save (upsert), screener save, consent/completion, therapist read
- ✅ Backend: PHQ-9 and GAD-7 scoring logic — severity bands computed server-side, PHQ-9 item 9 crisis flag
- ✅ Backend: Fixed missing `return` in `require_patient` auth dependency
- ✅ Backend: Onboarding schemas added to core_schemas — PatientProfileCreate/Read, ScreenerCreate/Read, OnboardingStatusRead, OnboardingDataRead
- ✅ Backend: AI pre-session brief now includes patient intake context — presenting concerns, therapy goals, baseline PHQ-9/GAD-7 scores
- ✅ Backend: Insights router queries PatientProfile and OnboardingScreener and passes them to the AI summary
- ✅ Backend: Seed data includes profiles and PHQ-9/GAD-7 baseline scores for Alice, Bob, and Carol
- ✅ Frontend: 5-step onboarding wizard — Profile → Presenting Concerns & Goals → PHQ-9 → GAD-7 → Consent
- ✅ Frontend: PHQ-9 step renders all 9 questions with 4-option response buttons (Not at all → Nearly every day)
- ✅ Frontend: GAD-7 step renders all 7 questions with same response format
- ✅ Frontend: Crisis banner shown on GAD-7 step when PHQ-9 item 9 response was > 0, with 988 Lifeline reference
- ✅ Frontend: Consent step explains what data the therapist sees before patient acknowledges
- ✅ Frontend: ReflectionForm checks onboarding status on mount and redirects to `/onboarding` if incomplete
- ✅ Frontend: Intake tab added to therapist's patient timeline — profile info, presenting concerns/goals, screener scores with severity labels and crisis flag badges
- ✅ Frontend: Onboarding API client functions — getOnboardingStatus, saveOnboardingProfile, saveOnboardingScreener, saveOnboardingConsent, getOnboardingData
- ⬜ Backend: Real JWT authentication — password hashing, token issuance, protected routes
- ⬜ Backend: Audit log model and middleware — PHI access recorded per request
- ⬜ Backend: Therapist-patient assignment model — therapists scoped to their own caseload
- ⬜ Backend: PHI guard on AI features — gate SOAP/DAP generation until BAA is in place
- ⬜ Backend: Soft deletes on all PHI-bearing models — records archived, never hard-deleted
- ⬜ Backend: Rate limiting on auth routes — brute-force protection
- ⬜ Frontend: Inactivity timeout — automatic session logoff after idle period
- ⬜ Infrastructure: HIPAA-eligible hosting — migrate from Railway/Vercel to AWS with BAA

---
