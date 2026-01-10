## Day 1 - Planning & Scope Lock

- Defined core problem and MVP scope
- Locked patient and therapist responsibilities
- Documented insight rules and non-goals

Specific things I thought about:

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
