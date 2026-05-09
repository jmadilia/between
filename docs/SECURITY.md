# Security Model

## What's Implemented

**Role-based access control**
Every endpoint is guarded by a role dependency. Therapist-only endpoints (`GET /patients/`, `GET /insights/`, `GET /reflections/`) return 403 to any non-therapist. Patient-only endpoints (`POST /reflections/`) return 403 to any non-patient. Roles are enforced at the database level via a `UserRole` enum column, not just application logic.

**Data isolation**
`GET /reflections/` performs an identity check beyond the role guard: if the requesting user is a patient, their ID must match the requested `patient_id`. A patient attempting to query another patient's reflections receives a 403. Therapists are exempt from this check as they require cross-patient access by design.

**Audit-friendly structure**
All core models include immutable `created_at` timestamps. `SessionSummary` ties summaries to a specific `user_id` via a foreign key, creating a traceable record of who generated what and when.

---

## What's Stubbed

**Authentication**
`get_current_user` currently returns a hardcoded user from the database rather than decoding a real session. In production, this function would extract a JWT from the `Authorization: Bearer <token>` request header, verify the signature and expiry, and look up the corresponding user. All role and isolation logic downstream remains unchanged.

---

## What Full HIPAA Compliance Would Add

- **AuditLog table** — record every data access event: who, what resource, what action, and when. Required for HIPAA audit trail obligations.
- **Token expiry and refresh** — short-lived access tokens (15–60 min) with a secure refresh flow to limit exposure from token theft.
- **Encrypted fields** — reflection content and other PHI (Protected Health Information) encrypted at rest, not just at the transport layer.
- **Rate limiting** — on auth endpoints to prevent brute-force credential attacks.
- **Consent tracking** — explicit patient consent records for data access, with timestamps and scope.
