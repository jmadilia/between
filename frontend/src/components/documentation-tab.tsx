import { useState } from "react";
import SOAPNotesSection from "./soap-notes-section";
import DAPNotesSection from "./dap-notes-section";

type Props = {
  patientId: number;
  patientName: string;
};

type NoteType = "soap" | "dap";

const NOTE_TYPES: { label: string; value: NoteType }[] = [
  { label: "SOAP", value: "soap" },
  { label: "DAP", value: "dap" },
];

function DocumentationTab({ patientId, patientName }: Props) {
  const [noteType, setNoteType] = useState<NoteType>("soap");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-fog-400">Note type</span>
        <div className="flex rounded-lg overflow-hidden border border-fog-200 dark:border-fog-700">
          {NOTE_TYPES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setNoteType(value)}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                noteType === value
                  ? "bg-fog-700 dark:bg-fog-200 text-fog-50 dark:text-fog-900"
                  : "bg-white dark:bg-fog-700 text-fog-700 dark:text-fog-400 hover:bg-fog-50 dark:hover:bg-fog-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {noteType === "soap" && (
        <SOAPNotesSection patientId={patientId} patientName={patientName} />
      )}
      {noteType === "dap" && (
        <DAPNotesSection patientId={patientId} patientName={patientName} />
      )}
    </div>
  );
}

export default DocumentationTab;
