import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Persona, createDemoPatient } from "../api";
import { usePersona } from "../persona";

const PATIENT_BLURBS: Record<string, string> = {
  "Alice Johnson": "Mood declining under work stress",
  "Bob Smith": "Recovering, anxiety easing",
  "Carol Rivera": "Hasn't checked in for two weeks",
};

const FEATURES = [
  {
    title: "AI pre-session brief",
    body: "Claude reads reflections, session notes, and SOAP/DAP notes since a chosen date and writes a short clinical summary.",
  },
  {
    title: "Rule-based signals first",
    body: "Mood trends, engagement gaps, and keyword flags are computed deterministically, so the brief still works without AI.",
  },
  {
    title: "AI drafts, clinician saves",
    body: "SOAP and DAP notes can be drafted by AI, but nothing becomes part of the record until the therapist reviews and saves it.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const { personas, loading, error, signInAs, refresh } = usePersona();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const therapist = personas.find((p) => p.role === "therapist");
  const patients = personas.filter((p) => p.role === "patient" && p.onboarding_completed);

  function enter(persona: Persona, path: string) {
    signInAs(persona);
    navigate(path);
  }

  async function startNewPatient() {
    setCreating(true);
    setCreateError(null);
    try {
      const persona = await createDemoPatient();
      await refresh();
      enter(persona, "/onboarding");
    } catch {
      setCreateError("Couldn't create a new patient. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 flex flex-col gap-10">
        <header className="flex flex-col gap-3 text-center items-center">
          <span className="text-xs font-medium uppercase tracking-widest text-fog-400">Interactive demo</span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-fog-900 dark:text-fog-50">Between</h1>
          <p className="text-base text-fog-700 dark:text-fog-200 max-w-2xl">
            Patients check in between therapy sessions. Therapists walk into the next session with an AI-written brief,
            mood trends, and structured clinical notes already in hand.
          </p>
          <p className="text-sm text-fog-400 max-w-2xl">
            No sign-up needed. Pick a role below. Everything you add is saved, and you can reset the demo at any time
            from the top bar.
          </p>
        </header>

        {error && (
          <p className="text-sm text-center text-red-500 bg-white dark:bg-fog-700 border border-fog-200 dark:border-fog-700 rounded-lg p-3">
            {error}
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="bg-white dark:bg-fog-700 rounded-xl border border-fog-200 dark:border-fog-700 shadow-sm p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fog-400 mb-1">Recommended start</p>
              <h2 className="text-lg font-semibold text-fog-900 dark:text-fog-50">Explore as the therapist</h2>
              <p className="text-sm text-fog-700 dark:text-fog-200 mt-1">
                Open a three-patient caseload as {therapist?.name ?? "Dr. Sarah Okonkwo"}. Generate a pre-session brief,
                read the mood chart, and draft SOAP or DAP notes.
              </p>
            </div>
            <button
              disabled={!therapist}
              onClick={() => therapist && enter(therapist, "/therapist")}
              className="mt-auto w-full bg-fog-700 dark:bg-fog-200 hover:bg-fog-900 dark:hover:bg-fog-400 disabled:opacity-50 text-fog-50 dark:text-fog-900 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Loading…" : "Open therapist dashboard"}
            </button>
          </div>

          <div className="bg-white dark:bg-fog-700 rounded-xl border border-fog-200 dark:border-fog-700 shadow-sm p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fog-400 mb-1">Patient side</p>
              <h2 className="text-lg font-semibold text-fog-900 dark:text-fog-50">Check in as a patient</h2>
              <p className="text-sm text-fog-700 dark:text-fog-200 mt-1">
                Log mood, symptoms, and a reflection. Then switch to the therapist to see it in the brief.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => enter(p, "/patient")}
                  className="w-full text-left rounded-lg border border-fog-200 dark:border-fog-600 px-3 py-2 hover:border-fog-400 transition-colors"
                >
                  <span className="block text-sm font-medium text-fog-900 dark:text-fog-50">{p.name}</span>
                  {PATIENT_BLURBS[p.name] && (
                    <span className="block text-xs text-fog-400">{PATIENT_BLURBS[p.name]}</span>
                  )}
                </button>
              ))}
              <button
                onClick={startNewPatient}
                disabled={creating || loading || !!error}
                className="w-full text-left rounded-lg border border-dashed border-fog-400 px-3 py-2 hover:border-fog-700 dark:hover:border-fog-200 disabled:opacity-50 transition-colors"
              >
                <span className="block text-sm font-medium text-fog-900 dark:text-fog-50">
                  {creating ? "Creating patient…" : "Start as a new patient"}
                </span>
                <span className="block text-xs text-fog-400">Walk through intake: profile, PHQ-9, GAD-7, consent</span>
              </button>
              {createError && <p className="text-xs text-red-500">{createError}</p>}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-fog-900 dark:text-fog-50">{f.title}</h3>
              <p className="text-sm text-fog-700 dark:text-fog-200">{f.body}</p>
            </div>
          ))}
        </section>

        <p className="text-xs text-center text-fog-400">
          A portfolio prototype with fictional patients, not a HIPAA-compliant product.{" "}
          <a
            href="https://github.com/jmadilia/between"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-fog-700 dark:hover:text-fog-200"
          >
            View the source on GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default Landing;
