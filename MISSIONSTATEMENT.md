# Between

## Problem Statement

### Problem

Therapy sessions are limited in time. The most important context is often lost between visits. Patients struggle to reflect consistently between sessions. Therapists lack structured insight into how patients are doing outside of regular visits.

### Solution

Between is a between-session reflection platform that helps patients track mood, symptoms, and goals, while providing therapists with concise, explainable summaries to guide care.

## Users & Core Value

### Patient

The patient gains value through reflection between sessions. They feel more prepared for their next therapy session. They also build more awareness over time of the advice and processing methods given by the therapist.

The key action of the patient is to submit a small reflection.

### Therapist

The therapist gains value through quicker understanding of how a patient has been doing. They spot trends before the session, spend less time catching up during the proceeding session, and spend more time treating.

The key action of the therapist is to review a pre-session summary.

## MVP Feature Lock

### Patient (MVP)

The patient should be able to enter their mood (1-5 scale), symptom severity (1-5 scale), and a reflection (free-text).

### Therapist (MVP)

The therapist should be able to see a timeline of reflections, a mood trend over time, and an auto-generated pre-session summary.

## Insight Engine v1

### Rules

- Mood trend:
  - Declining if average of last three is less than the previous three
- Engagement:
  - Missed reflection in last five days
- Keywords:
  - sleep, strees, work, anxiety

The algorithm **must** be rule-based, deterministic, and explainable.

## Tech Scope Lock

### Frontend

- React
- TypeScript
- Accessible, reusable forms
- Minimal styling
- Browser-based (no dedicated mobile app)

### Backend

- Python (FastAPI)
- PostgreSQL
- Typed schemas
- REST APIs

## Data Model

### Core Entities

- User
  - id
  - role (patient | therapist)
- Reflection
  - patient_id (foreign key on User table)
  - mood
  - symptom_severity
  - text
  - created_at
- InsightSummary
  - patient_id (foreign key on User table)
  - summary_text
  - flags
  - generated_at

## Not-in-scope List

- Scheduling
- Messaging
- Notifications
- HIPAA certification claims
- Diagnosis or treatment recommendations
- AI-generated therapy advice
