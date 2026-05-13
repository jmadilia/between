import { useState, type SubmitEvent } from "react";
import { submitReflection } from "../api";

function ReflectionForm() {
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState(3);
  const [symptomSeverity, setSymptomSeverity] = useState(3);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PATIENT_ID = 1;

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitReflection({
        patient_id: PATIENT_ID,
        content: reflection,
        mood,
        symptom_severity: symptomSeverity,
      });
      setSuccess(true);
      setReflection("");
      setMood(3);
      setSymptomSeverity(3);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex-1 bg-fog-50 dark:bg-fog-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-fog-700 rounded-xl shadow-sm border border-fog-200 dark:border-fog-700 w-full max-w-lg p-8 text-center">
          <p className="text-2xl mb-2">✓</p>
          <h2 className="text-lg font-semibold text-fog-900 dark:text-fog-50 mb-1">Reflection submitted</h2>
          <p className="text-sm text-fog-400 mb-6">Thank you for checking in.</p>
          <button
            onClick={() => setSuccess(false)}
            className="text-sm text-fog-700 dark:text-fog-200 hover:underline"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-fog-50 dark:bg-fog-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-fog-700 rounded-xl shadow-sm border border-fog-200 dark:border-fog-700 w-full max-w-lg p-8">
        <h1 className="text-xl font-semibold text-fog-900 dark:text-fog-50 mb-1">
          How are you doing?
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
    </div>
  );
}

export default ReflectionForm;
