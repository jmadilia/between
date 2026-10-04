import { useState, useEffect, useCallback, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { type Reflection, submitReflection, getReflections, apiErrorMessage } from "../api";
import { usePersona } from "../persona";
import ReflectionCard from "./reflection-card";

function ReflectionForm() {
  const navigate = useNavigate();
  const { persona, personas, signInAs } = usePersona();
  const patientId = persona!.id;
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState(3);
  const [symptomSeverity, setSymptomSeverity] = useState(3);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<Reflection[]>([]);

  const loadHistory = useCallback(async () => {
    setHistory(await getReflections(patientId));
  }, [patientId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount / persona change
    loadHistory().catch(() => setHistory([]));
  }, [loadHistory]);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitReflection({
        patient_id: patientId,
        content: reflection,
        mood,
        symptom_severity: symptomSeverity,
      });
      setSuccess(true);
      setReflection("");
      setMood(3);
      setSymptomSeverity(3);
      loadHistory().catch(() => undefined);
    } catch (err) {
      setError(apiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  if (!persona!.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const firstName = persona!.name.split(" ")[0];

  function viewAsTherapist() {
    const therapist = personas.find((p) => p.role === "therapist");
    if (therapist) signInAs(therapist);
    navigate(`/therapist?patient=${patientId}`);
  }

  const historySection = history.length > 0 && (
    <div className="w-full max-w-lg flex flex-col gap-3">
      <h2 className="text-sm font-medium text-fog-900 dark:text-fog-50">Your recent check-ins</h2>
      {history.slice(0, 5).map((r) => (
        <ReflectionCard key={r.id} reflection={r} />
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="flex-1 bg-fog-50 dark:bg-fog-900 flex flex-col items-center justify-center gap-6 p-4 py-10">
        <div className="bg-white dark:bg-fog-700 rounded-xl shadow-sm border border-fog-200 dark:border-fog-700 w-full max-w-lg p-8 text-center">
          <p className="text-2xl mb-2">✓</p>
          <h2 className="text-lg font-semibold text-fog-900 dark:text-fog-50 mb-1">Reflection submitted</h2>
          <p className="text-sm text-fog-400 mb-6">
            Thank you for checking in. It's saved and already visible to your therapist.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={viewAsTherapist}
              className="text-sm font-medium bg-fog-700 dark:bg-fog-200 hover:bg-fog-900 dark:hover:bg-fog-400 text-fog-50 dark:text-fog-900 px-4 py-2 rounded-lg transition-colors"
            >
              See it from the therapist's side
            </button>
            <button
              onClick={() => setSuccess(false)}
              className="text-sm text-fog-700 dark:text-fog-200 hover:underline"
            >
              Submit another
            </button>
          </div>
        </div>
        {historySection}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-fog-50 dark:bg-fog-900 flex flex-col items-center justify-center gap-6 p-4 py-10">
      <div className="bg-white dark:bg-fog-700 rounded-xl shadow-sm border border-fog-200 dark:border-fog-700 w-full max-w-lg p-8">
        <h1 className="text-xl font-semibold text-fog-900 dark:text-fog-50 mb-1">
          How are you doing, {firstName}?
        </h1>
        <p className="text-sm text-fog-400 mb-6">
          Share how you've been feeling since your last session.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <textarea
            placeholder="How have you been feeling since your last session?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={5}
            className="w-full border border-fog-200 dark:border-fog-900 rounded-lg p-3 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-900 resize-none focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-400"
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-fog-900 dark:text-fog-50">
              Mood — <span className="text-fog-700 dark:text-fog-200">{mood}/5</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full accent-fog-700 dark:accent-fog-200"
            />
            <div className="flex justify-between text-xs text-fog-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-fog-900 dark:text-fog-50">
              Symptom Severity —{" "}
              <span className="text-fog-700 dark:text-fog-200">{symptomSeverity}/5</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={symptomSeverity}
              onChange={(e) => setSymptomSeverity(Number(e.target.value))}
              className="w-full accent-fog-700 dark:accent-fog-200"
            />
            <div className="flex justify-between text-xs text-fog-400">
              <span>Mild</span>
              <span>Severe</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fog-700 dark:bg-fog-200 hover:bg-fog-900 dark:hover:bg-fog-400 disabled:opacity-50 text-fog-50 dark:text-fog-900 text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
      {historySection}
    </div>
  );
}

export default ReflectionForm;
