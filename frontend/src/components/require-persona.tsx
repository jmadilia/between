import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePersona } from "../persona";

type Props = {
  role: "patient" | "therapist";
  children: ReactNode;
};

/**
 * Deep links like /therapist should just work, so if the visitor hasn't picked
 * a persona for this side of the app yet we sign them in as the default one.
 */
function RequirePersona({ role, children }: Props) {
  const { persona, personas, loading, error, signInAs } = usePersona();
  const matches = persona?.role === role;
  // Only auto-pick when the page was opened without a matching persona. If the
  // persona changes while we're mounted, the visitor is already navigating away
  // (switch role, reset, "see it from the therapist's side"), so stay out of the way.
  const [autoPick] = useState(!matches);
  const fallback = autoPick ? personas.find((p) => p.role === role && p.onboarding_completed) : undefined;

  useEffect(() => {
    if (!matches && fallback) signInAs(fallback);
  }, [matches, fallback, signInAs]);

  if (matches) return <>{children}</>;
  if (!autoPick) return null;
  if (loading || fallback) {
    return <p className="flex-1 flex items-center justify-center text-sm text-fog-400">Loading demo…</p>;
  }
  if (error) {
    return <p className="flex-1 flex items-center justify-center text-sm text-fog-400 p-6 text-center">{error}</p>;
  }
  return <Navigate to="/" replace />;
}

export default RequirePersona;
