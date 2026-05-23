import { useState, useEffect } from "react";
import { type DAPNote, getDAPNotes } from "../api";
import DAPNoteForm from "./dap-note-form";
import { exportDAPAsTxt, exportDAPAsPdf } from "../utils/export";

type Props = {
  patientId: number;
  patientName: string;
};

const LABELS = ["Data", "Assessment", "Plan"] as const;
type Label = typeof LABELS[number];
const FIELD_MAP: Record<Label, keyof DAPNote> = {
  Data: "data",
  Assessment: "assessment",
  Plan: "plan",
};

function DAPNotesSection({ patientId, patientName }: Props) {
  const [notes, setNotes] = useState<DAPNote[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getDAPNotes(patientId).then(setNotes);
  }, [patientId]);

  function handleSaved() {
    setShowForm(false);
    getDAPNotes(patientId).then(setNotes);
  }

  return (
    <div className="bg-white dark:bg-fog-700 border border-fog-200 dark:border-fog-700 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-fog-900 dark:text-fog-50">DAP Notes</h3>
          <p className="text-xs text-fog-400">Data, Assessment, Plan — structured clinical documentation.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-fog-700 dark:bg-fog-200 hover:bg-fog-900 dark:hover:bg-fog-400 text-fog-50 dark:text-fog-900 transition-colors"
          >
            New DAP Note
          </button>
        )}
      </div>

      {showForm && (
        <div className="border-t border-fog-200 dark:border-fog-700 pt-3">
          <DAPNoteForm
            patientId={patientId}
            onSaved={handleSaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {notes.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-fog-200 dark:border-fog-700 pt-3">
          {notes.map((note) => (
            <div key={note.id} className="flex flex-col gap-1">
              <button
                onClick={() => setExpanded(expanded === note.id ? null : note.id)}
                className="flex items-center justify-between text-left w-full group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-fog-900 dark:text-fog-50">
                    {new Date(note.session_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>
                  {expanded !== note.id && (
                    <span className="text-xs text-fog-400 truncate max-w-xs">
                      {note.data.slice(0, 80)}{note.data.length > 80 ? "…" : ""}
                    </span>
                  )}
                </div>
                <span className="text-xs text-fog-400 group-hover:text-fog-700 dark:group-hover:text-fog-200 transition-colors">
                  {expanded === note.id ? "Collapse" : "View"}
                </span>
              </button>

              {expanded === note.id && (
                <div className="flex flex-col gap-3 mt-1 pl-1">
                  {LABELS.map((label) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-fog-700 dark:text-fog-200">
                        {label}
                      </span>
                      <p className="text-sm text-fog-900 dark:text-fog-50 border-l-2 border-fog-400 pl-3">
                        {note[FIELD_MAP[label]] as string}
                      </p>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => exportDAPAsTxt(note, patientName)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-fog-200 dark:border-fog-700 bg-white dark:bg-fog-900 text-fog-700 dark:text-fog-200 hover:bg-fog-50 dark:hover:bg-fog-700 transition-colors"
                    >
                      Export TXT
                    </button>
                    <button
                      onClick={() => exportDAPAsPdf(note, patientName)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-fog-200 dark:border-fog-700 bg-white dark:bg-fog-900 text-fog-700 dark:text-fog-200 hover:bg-fog-50 dark:hover:bg-fog-700 transition-colors"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {notes.length === 0 && !showForm && (
        <p className="text-xs text-fog-400">No DAP notes yet.</p>
      )}
    </div>
  );
}

export default DAPNotesSection;
