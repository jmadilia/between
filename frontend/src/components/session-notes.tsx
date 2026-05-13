import { useState, useEffect } from "react";
import { type Note, getNotes, createNote } from "../api";

type Props = {
  patientId: number;
};

function SessionNotes({ patientId }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [sessionDate, setSessionDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotes(patientId).then(setNotes);
  }, [patientId]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const note = await createNote({ patient_id: patientId, content, session_date: sessionDate });
      setNotes((prev) => [note, ...prev]);
      setContent("");
    } catch {
      setError("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white dark:bg-fog-700 border border-fog-200 dark:border-fog-700 rounded-lg p-4 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-fog-900 dark:text-fog-50">Session Notes</h3>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-fog-400 whitespace-nowrap">Session date</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="text-xs border border-fog-200 dark:border-fog-900 rounded px-2 py-1 bg-fog-50 dark:bg-fog-900 text-fog-900 dark:text-fog-50 focus:outline-none focus:ring-1 focus:ring-fog-400"
          />
        </div>
        <textarea
          placeholder="Add a session note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full border border-fog-200 dark:border-fog-900 rounded-lg p-3 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-900 resize-none focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-400"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="self-end text-sm bg-fog-700 dark:bg-fog-200 hover:bg-fog-900 dark:hover:bg-fog-400 disabled:opacity-50 text-fog-50 dark:text-fog-900 font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>

      {notes.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-fog-200 dark:border-fog-700 pt-3">
          {notes.map((note) => (
            <div key={note.id} className="flex flex-col gap-1">
              <p className="text-xs text-fog-400">
                {new Date(note.session_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </p>
              <p className="text-sm text-fog-700 dark:text-fog-200 border-l-2 border-fog-400 pl-3">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionNotes;
