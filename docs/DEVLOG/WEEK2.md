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

---

### Completing the Reflection Data Model

- Added `mood` (1–5) and `symptom_severity` (1–5) fields to the `Reflection` model, schema, and router
  - These are the core patient inputs defined in the MVP spec — the model was incomplete without them
  - Pydantic `Field(ge=1, le=5)` enforces valid range at the API boundary before anything hits the database
- Updated `POST /reflections` to accept and persist both new fields
- Implemented `GET /reflections?patient_id=` — first read endpoint
  - Query parameter pattern: FastAPI infers query params from plain function arguments (no request body)
  - SQLAlchemy filter: `db.query(Reflection).filter(Reflection.patient_id == patient_id).all()`

### Database Migrations with Alembic

- Introduced Alembic for schema version control — replaces the `drop + recreate` dev workflow
  - Alembic tracks applied migrations in an `alembic_version` table; `upgrade head` is idempotent
  - `autogenerate` diffs SQLAlchemy models against the live database and writes the migration file
- First real migration: `add mood and symptom_severity to reflections`
  - Hit a `NotNullViolation` on upgrade — existing rows had no value for the new `NOT NULL` columns
  - Fixed by adding `server_default` in the migration to backfill existing rows, then dropping the default
  - This is the correct production pattern: you can never truncate a live table, so migrations must handle existing data explicitly
- `alembic.ini` contains the database URL (including credentials) — added to `.gitignore`, committed an `.ini.example` with a placeholder instead

#### Learnings

- Model separation makes test isolation easier
- Pydantic v2 moved BaseSettings → pydantic_settings (import gotcha)
- Explicit model imports in init_db.py required for SQLAlchemy to discover models before metadata.create_all()
- Adding a `NOT NULL` column to a table with existing rows requires a `server_default` in the migration — the database needs a value for every existing row before it can enforce the constraint
- On Windows, psycopg2 can misinterpret `localhost` in a connection URL as a Unix socket path — use `127.0.0.1` explicitly to force TCP
- Credentials in config files (like `alembic.ini`) must never be committed — use `.gitignore` + a `.example` template

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
- Migration strategy
  - Considered staying on `drop + recreate` for the duration of dev
  - Switched to Alembic early — the `NotNullViolation` incident made clear that real migration discipline matters even in development
