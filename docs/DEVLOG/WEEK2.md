## Week 2

### Backend Skeleton Progression

- Finalized FastAPI directory structure
- Locked router registration pattern
- Stubbed auth layer (role-based)
- Core models and schemas defined
- `/health` endpoint added
- App boots cleanly

### API + Validation

- Refactored models into separate files (user.py, reflection.py, session_summary.py)
  - Cleaner imports and easier to scale
  - Core models now contains only DeclarativeBase
- Implemented POST /reflections endpoint (first working API endpoint)
  - Full CRUD handler with database transaction
  - Pydantic validation (ReflectionCreate, ReflectionRead schemas)
  - Proper HTTP status codes and response models
- Updated database initialization
  - init_db.py now drops and recreates tables (dev iteration workflow)
  - Added explicit model imports to ensure registration with Base
- Fixed configuration
  - pydantic_settings for Pydantic v2 compatibility
  - Corrected .env file path resolution

#### Learnings

- Model separation makes test isolation easier
- Pydantic v2 moved BaseSettings → pydantic_settings (import gotcha)
- Explicit model imports in init_db.py required for SQLAlchemy to discover models before metadata.create_all()

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
