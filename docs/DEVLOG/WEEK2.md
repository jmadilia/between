## Week 2

### Backend Skeleton Progression

- Finalized FastAPI directory structure
- Locked router registration pattern
- Stubbed auth layer (role-based)
- Core models and schemas defined
- `/health` endpoint added
- App boots cleanly

#### Technical Options Weighed

- Routing structure
  - Considered splitting routes across api/ vs routers/
  - Chose a single routers/ directory to avoid ambiguity and match FastAPI conventions
- Auth approach
  - Considered full authentication early
  - Deferred real auth in favor of a role-based auth stub to avoid premature complexity
- Database integration
  - Considered wiring PostgreSQL immediately
  - Deferred live DB work to avoid environment friction and focus on structural correctness
- Project layout
  - Considered feature-based modules early
  - Chose a layered structure (core, db, models, schemas, routers) for clarity and scalability
