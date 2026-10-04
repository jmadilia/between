import json
from anthropic import AsyncAnthropic, AuthenticationError, APIError
from fastapi import HTTPException, status
from app.core.config import settings

_client: AsyncAnthropic | None = None


def _get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


def _format_reflections(reflections: list) -> str:
    sorted_refs = sorted(reflections, key=lambda r: r.created_at)[-10:]
    lines = []
    for r in sorted_refs:
        d = r.created_at.strftime("%Y-%m-%d")
        lines.append(f"[{d}] Mood {r.mood}/5, Severity {r.symptom_severity}/5: {r.content[:400]}")
    return "\n".join(lines) if lines else "No reflections recorded."


def _format_notes(notes: list) -> str:
    lines = [f"[{n.session_date}] {n.content[:400]}" for n in notes[-10:]]
    return "\n".join(lines) if lines else "No session notes recorded."


def _quantitative_summary(reflections: list) -> str:
    if not reflections:
        return "No quantitative data available."
    sorted_refs = sorted(reflections, key=lambda r: r.created_at)[-4:]
    moods = [r.mood for r in sorted_refs]
    severities = [r.symptom_severity for r in sorted_refs]
    avg_mood = sum(moods) / len(moods)
    avg_sev = sum(severities) / len(severities)
    trend = "improving" if moods[-1] > moods[0] else "declining" if moods[-1] < moods[0] else "stable"
    return (
        f"Mood scores (oldest to newest): {', '.join(str(m) for m in moods)}/5 "
        f"(avg {avg_mood:.1f}, trend: {trend}). "
        f"Symptom severity scores: {', '.join(str(s) for s in severities)}/5 "
        f"(avg {avg_sev:.1f})."
    )


async def generate_dap_draft(
    patient_name: str,
    reflections: list,
    notes: list,
) -> dict:
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI drafting is turned off on this deployment (no Anthropic API key). You can still write the note by hand below.",
        )

    prompt = f"""You are a clinical documentation assistant helping a licensed therapist write a DAP note for a therapy session. DAP stands for Data, Assessment, Plan. Generate a professional, concise DAP note based on the data below.

Patient: {patient_name}

Patient between-session reflections (oldest to newest):
{_format_reflections(reflections)}

Quantitative data:
{_quantitative_summary(reflections)}

Therapist session notes:
{_format_notes(notes)}

Return ONLY a JSON object with exactly these three string keys: "data", "assessment", "plan". No markdown, no code fences, no explanation — raw JSON only.

Guidelines per section:
- data: A unified account combining what the patient reported (their words, feelings, self-reported experiences from reflections) with what was observed (mood/severity scores, affect, behavior, engagement patterns from therapist notes). Integrate both sources into a coherent clinical picture. 3-5 sentences.
- assessment: Clinical interpretation — patterns, progress or regression, key themes, clinical impression. Do not assign a diagnosis. 2-4 sentences.
- plan: Next steps — therapeutic interventions, behavioral tasks or homework, referrals, follow-up cadence, focus areas for the next session. 2-4 sentences."""

    try:
        client = _get_client()
        message = await client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unexpected format. Please try again.",
        )
    except (AuthenticationError, APIError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI generation failed. Please try again or enter the note manually.",
        )
