## Week 1

### Planning & Scope Lock

- Defined core problem and MVP scope
- Locked patient and therapist responsibilities
- Documented insight rules and non-goals

Things to consider:

- Users. Should they be split into two different tables? One for the patient, one for the therapist?
  - I landed on keeping these two entities united in **the same Users table**
  - With two different tables, we could end up with things like:
    - two different emails for the same person (if a therapist becomes a patient)
    - conflated context
    - security edge cases
    - sync'ing complexity
    - messy audit trails
  - With both in the same Users table, we get:
    - single logins
    - easier context switching
    - cleaner audit trails
    - no account duplication
    - better layering (identity layer vs. role-specific data, i.e. PatientProfile and TherapistProfile tables each with their own user_id that links back to the Users table)
- Therapists. Specifically, additional information to keep track of for therapists, such as:
  - Profile information and professional context
    - states they are licensed in
    - methods of care (CBT, ACT, psychodynamic)
    - areas of focus (anxiety, depression, trauma)
    - session cadence preferences (weekly, biweekly)
  - Personalized insight criteria
    - What makes a drop in mood actually significant
    - Specific keywords a single therapist can have the system listen for
    - How many missed reflections are actually a concern
  - Caseload and workload awareness
    - number of active patients
    - engagement overview across caseload
    - patients that need attention soon
  - Keeping therapist data minimal means quicker MVP and a model that supports adding professional context for finer tuned insights later. For the MVP, reflection quality and insight generation are taking precedence.

Things I learned about:

- SQLAlchemy
  - I had only heard of it before
  - The concept of two distinct APIs, the Core and ORM, building on top of each other seemed unusual.
  - My best summary of it:
    - SQLAlchemy helps to work with databases using Python objects and code by translating the code into SQL instead of writing raw SQL all the time
    - The Core is focused on the SQL part. It describes the tables and queries in Python, then generates the SQL
    - The ORM defines the Python classes that represent the database tables. Rows become Python objects, and we interact with the data using attributes and methods instead of joins and `SELECT` statements
    - Highest abstraction sense: we can write and think in Python, then we're translated to SQL to talk to the database

### Backend Skeleton - Python

- Restructured to `app` and `routers` folders
- Added SQLAlchemy models: User, Reflection, SessionSummary
- Created FastAPI routers: users, reflections, session_summaries
- Set up local PostgreSQL database for testing
- Set up DB: `session.py` and `init_db.py`
- Added schemas, `requirements.txt`, and VS Code config
