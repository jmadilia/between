from anthropic import AsyncAnthropic, AuthenticationError, APIError
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
        date = r.created_at.strftime("%Y-%m-%d")
        snippet = r.content[:400].replace("\n", " ")
        lines.append(f"[{date}] Mood {r.mood}/5, Severity {r.symptom_severity}/5: {snippet}")
    return "\n".join(lines)


def _format_notes(notes: list) -> str:
    lines = []
    for n in notes[-10:]:
        snippet = n.content[:400].replace("\n", " ")
        lines.append(f"[{n.session_date}] {snippet}")
    return "\n".join(lines)


def _format_soap_notes(soap_notes: list) -> str:
    lines = []
    for n in soap_notes[-5:]:
        lines.append(
            f"[{n.session_date}] "
            f"Subjective: {n.subjective[:200].replace(chr(10), ' ')} | "
            f"Objective: {n.objective[:200].replace(chr(10), ' ')} | "
            f"Assessment: {n.assessment[:200].replace(chr(10), ' ')} | "
            f"Plan: {n.plan[:200].replace(chr(10), ' ')}"
        )
    return "\n".join(lines)


def _format_dap_notes(dap_notes: list) -> str:
    lines = []
    for n in dap_notes[-5:]:
        lines.append(
            f"[{n.session_date}] "
            f"Data: {n.data[:200].replace(chr(10), ' ')} | "
            f"Assessment: {n.assessment[:200].replace(chr(10), ' ')} | "
            f"Plan: {n.plan[:200].replace(chr(10), ' ')}"
        )
    return "\n".join(lines)


async def generate_ai_summary(
    patient_name: str,
    reflections: list,
    notes: list,
    trends: list[str],
    flags: list[str],
    fallback_summary: str,
    soap_notes: list | None = None,
    dap_notes: list | None = None,
) -> str:
    if not reflections or not settings.ANTHROPIC_API_KEY:
        return fallback_summary

    reflection_text = _format_reflections(reflections)
    trends_text = "; ".join(trends) if trends else "none detected"
    flags_text = "; ".join(flags) if flags else "none detected"

    notes_section = (
        f"\nTherapist session notes (oldest to newest):\n{_format_notes(notes)}"
        if notes else ""
    )
    soap_section = (
        f"\nSOAP notes from this period (oldest to newest):\n{_format_soap_notes(soap_notes)}"
        if soap_notes else ""
    )
    dap_section = (
        f"\nDAP notes from this period (oldest to newest):\n{_format_dap_notes(dap_notes)}"
        if dap_notes else ""
    )

    prompt = f"""You are a clinical decision support tool used by a licensed therapist. \
Based on the patient's between-session reflections, therapist session notes, and any formal \
clinical documentation (SOAP or DAP notes), write a 2-4 sentence pre-session brief. \
Be concise and clinical — focus on mood patterns, recurring themes, progress against prior \
plans, and anything that warrants attention in the upcoming session. \
Do not give diagnoses or treatment recommendations. \
Write only the brief with no preamble or labels.

Patient: {patient_name}

Patient reflections (oldest to newest):
{reflection_text}{notes_section}{soap_section}{dap_section}

Detected patterns:
- Mood trends: {trends_text}
- Recurring themes: {flags_text}"""

    try:
        client = _get_client()
        message = await client.messages.create(
            model="claude-opus-4-7",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except (AuthenticationError, APIError):
        return fallback_summary
