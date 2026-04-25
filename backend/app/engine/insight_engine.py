class InsightEngine:
  def analyze(self, reflections: list) -> dict:
    """
    Analyze a list of reflections and return insights.
    Returns: { "trends": [...], "flags": [...], "summary": "..." }
    """
    if not reflections:
      return { "trends": [], "flags": [], "summary": "No data yet." }
    
    trends = []
    mood_trend = self._detect_mood_trend(reflections)
    if mood_trend:
      trends.append(mood_trend)

    engagement = self._detect_engagement(reflections)
    if engagement:
      trends.append(engagement)
    
    flags = self._detect_keywords(reflections)

    # build summary from trends + flags
    summary = self._build_summary(trends, flags)

    return { "trends": trends, "flags": flags, "summary": summary }
  
  def _build_summary(self, trends: list, flags: list) -> str:
    """ Combine trends and flags into a plain-English paragraph. """
    parts = []

    if trends:
      parts.append("Trends: " + "; ".join(trends) + ".")

    if flags:
      parts.append("Notable themes: " + "; ".join(flags) + ".")

    if not parts:
      return "No significant patterns detected."
    
    return " ".join(parts)

  def _detect_mood_trend(self, reflections: list) -> str | None:
    """
    Compare mood across last N reflections.
    If mood is declining, return "Mood declining over last X check-ins.
    If stable/improving, return None.
    """
    if len(reflections) < 3:
      return None
    
    sorted_refs = sorted(reflections, key=lambda r: r.created_at)
    oldest = sorted_refs[:2]
    newest = sorted_refs[-2:]

    avg_oldest = sum(r.mood for r in oldest) / len(oldest)
    avg_newest = sum(r.mood for r in newest) / len(newest)

    if avg_newest <= avg_oldest - 2:
      return f"Mood declining over last {len(sorted_refs)} check-ins"
    
    return None

  def _detect_engagement(self, reflections: list, days_back: int = 7) -> str | None:
    """
    Check if patient has submitted reflections regularly.
    If last reflection is >3 days old, flag low engagement.
    """
    from datetime import datetime, timezone

    if not reflections:
      return None
    
    latest = max(reflections, key=lambda r: r.created_at)
    now = datetime.now(timezone.utc)
    last_created = latest.created_at.replace(tzinfo=timezone.utc)
    days_since = (now - last_created).days

    if days_since > 3:
      return f"Low engagement: last check-in was {days_since} days ago"
    
    return None

  def _detect_keywords(self, reflections: list) -> list[str]:
    """
    Scan reflection count for keywords: sleep, stress, work, anxiety, etc.
    Return list of findings like "Sleep mentioned 3x"
    """
    keywords = {
      "sleep": ["sleep", "insomnia", "tired", "exhausted"],
      "stress": ["stress", "stressed", "overwhelmed"],
      "work": ["work", "job", "boss", "coworker"],
      "anxiety": ["anxiety", "anxious", "nervous", "worry", "worried"],
    }

    counts: dict[str, int] = {category: 0 for category in keywords}

    for reflection in reflections:
      content = reflection.content.lower()
      for category, terms in keywords.items():
        if any(term in content for term in terms):
          counts[category] += 1

    return [
      f"{category.capitalize()} mentioned {count}x"
        for category, count in counts.items()
        if count >= 2
    ]
