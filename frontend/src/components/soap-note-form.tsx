import { useState } from "react";
import {
  type SOAPDraft,
  type SOAPNotePayload,
  generateSOAPDraft,
  createSOAPNote,
  apiErrorMessage,
} from "../api";

type Props = {
  patientId: number;
  onSaved: () => void;
  onCancel: () => void;
};

const FIELDS: { key: keyof SOAPDraft; label: string; description: string }[] = [
  { key: "subjective", label: "Subjective", description: "What the patient reported — their words, feelings, and concerns." },
  { key: "objective", label: "Objective", description: "Observable data — mood/severity scores, affect, behavior, clinician observations." },
  { key: "assessment", label: "Assessment", description: "Clinical interpretation — patterns, progress, clinical impression." },
  { key: "plan", label: "Plan", description: "Next steps — interventions, homework, referrals, follow-up cadence." },
];

function SOAPNoteForm({ patientId, onSaved, onCancel }: Props) {
  const [sessionDate, setSessionDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [draft, setDraft] = useState<SOAPDraft>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [aiGenerated, setAiGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateSOAPDraft(patientId, sessionDate);
      setDraft(result);
      setAiGenerated(true);
    } catch (err: unknown) {
      const msg = apiErrorMessage(err, "Generation failed. Please try again or enter manually.");
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!draft.subjective || !draft.objective || !draft.assessment || !draft.plan) {
      setError("All four sections are required before saving.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: SOAPNotePayload = { patient_id: patientId, session_date: sessionDate, ...draft };
      await createSOAPNote(payload);
      onSaved();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-fog-900 dark:text-fog-50">New SOAP Note</h3>
          <p className="text-xs text-fog-400">Review all fields carefully before saving.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-fog-400">Session date</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="text-xs border border-fog-200 dark:border-fog-900 rounded px-2 py-1 bg-fog-50 dark:bg-fog-900 text-fog-900 dark:text-fog-50 focus:outline-none focus:ring-1 focus:ring-fog-400"
          />
        </div>
      </div>

      {aiGenerated && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-fog-50 dark:bg-fog-900 border border-fog-200 dark:border-fog-700">
          <span className="text-xs text-fog-700 dark:text-fog-200">
            AI-generated draft — review and edit each section before saving.
          </span>
        </div>
      )}

      {FIELDS.map(({ key, label, description }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-fog-700 dark:text-fog-200">
            {label}
          </label>
          <p className="text-xs text-fog-400">{description}</p>
          <textarea
            value={draft[key]}
            onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
            rows={4}
            placeholder={`Enter ${label.toLowerCase()}...`}
            className="w-full border border-fog-200 dark:border-fog-900 rounded-lg p-3 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-900 resize-none focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-400"
          />
        </div>
      ))}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleGenerate}
          disabled={generating || saving}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-fog-200 dark:border-fog-700 bg-white dark:bg-fog-900 text-fog-700 dark:text-fog-200 hover:bg-fog-50 dark:hover:bg-fog-700 disabled:opacity-50 transition-colors"
        >
          {generating ? "Generating..." : aiGenerated ? "Regenerate with AI" : "Generate with AI"}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="text-sm text-fog-400 hover:text-fog-700 dark:hover:text-fog-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || generating}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-fog-700 dark:bg-fog-200 hover:bg-fog-900 dark:hover:bg-fog-400 disabled:opacity-50 text-fog-50 dark:text-fog-900 transition-colors"
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SOAPNoteForm;
