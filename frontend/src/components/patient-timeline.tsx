import { useState, useEffect } from "react";
import {
  type Reflection,
  type Insights,
  type InsightWindow,
  getReflections,
  getInsights,
} from "../api";
import ReflectionCard from "./reflection-card";
import MoodChart from "./mood-chart";
import SessionNotes from "./session-notes";
import SOAPNotesSection from "./soap-notes-section";

type Props = {
  patientId: number | null;
  patientName: string | null;
};

type Tab = "overview" | "reflections" | "notes" | "soap";

const TABS: { label: string; value: Tab }[] = [
  { label: "Overview", value: "overview" },
  { label: "Reflections", value: "reflections" },
  { label: "Notes", value: "notes" },
  { label: "SOAP Notes", value: "soap" },
];

const WINDOWS: { label: string; value: InsightWindow }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
];

function PatientTimeline({ patientId, patientName }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [window, setWindow] = useState<InsightWindow>("all");
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (patientId === null) return;
    setTab("overview");
    setInsights(null);
    setLoadingReflections(true);
    getReflections(patientId).then((data) => {
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setReflections(sorted);
      setLoadingReflections(false);
    });
  }, [patientId]);

  async function handleGenerate() {
    if (patientId === null) return;
    setGenerating(true);
    try {
      const data = await getInsights(patientId, window);
      setInsights(data);
    } finally {
      setGenerating(false);
    }
  }

  if (patientId === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-fog-400">Select a patient to view their timeline.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tab bar — does not scroll */}
      <div className="flex flex-none border-b border-fog-200 dark:border-fog-700 bg-white dark:bg-fog-900">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === value
                ? "border-fog-700 dark:border-fog-200 text-fog-900 dark:text-fog-50"
                : "border-transparent text-fog-400 hover:text-fog-700 dark:hover:text-fog-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content — scrolls independently */}
      <div className="flex-1 overflow-y-auto">
        {loadingReflections ? (
          <p className="text-fog-400 p-4">Loading...</p>
        ) : (
          <>
            {tab === "overview" && (
              <div className="flex flex-col gap-4 p-4">
                {reflections.length > 0 && <MoodChart reflections={reflections} />}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-fog-900 dark:text-fog-50">Pre-Session Summary</span>
                      <span className="text-xs text-fog-400">AI-generated from reflections and session notes</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-fog-400">Time window</span>
                      <div className="flex rounded-lg overflow-hidden border border-fog-200 dark:border-fog-700">
                        {WINDOWS.map(({ label, value }) => (
                          <button
                            key={value}
                            onClick={() => setWindow(value)}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${
                              window === value
                                ? "bg-fog-700 dark:bg-fog-200 text-fog-50 dark:text-fog-900"
                                : "bg-white dark:bg-fog-700 text-fog-700 dark:text-fog-400 hover:bg-fog-50 dark:hover:bg-fog-900"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {generating ? (
                    <div className="bg-white dark:bg-fog-700 border border-fog-200 dark:border-fog-700 rounded-lg p-4">
                      <p className="text-sm text-fog-400">Generating summary...</p>
                    </div>
                  ) : insights ? (
                    <div className="bg-white dark:bg-fog-700 border border-fog-200 dark:border-fog-700 rounded-lg p-4 flex flex-col gap-2">
                      <p className="text-sm text-fog-900 dark:text-fog-50">{insights.summary}</p>
                      {insights.trends.length > 0 && (
                        <ul className="text-xs text-fog-700 dark:text-fog-200 list-disc list-inside">
                          {insights.trends.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      )}
                      {insights.flags.length > 0 && (
                        <ul className="text-xs text-fog-900 dark:text-fog-200 list-disc list-inside">
                          {insights.flags.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-fog-400">Generated by Claude · claude-opus-4-7</p>
                        <button
                          onClick={handleGenerate}
                          className="text-xs font-medium px-3 py-1 rounded-lg border border-fog-200 dark:border-fog-700 bg-white dark:bg-fog-900 text-fog-700 dark:text-fog-200 hover:bg-fog-50 dark:hover:bg-fog-700 transition-colors"
                        >
                          Regenerate
                        </button>
                      </div>
                      {reflections.length > 0 && (
                        <div className="border-t border-fog-200 dark:border-fog-700 pt-2">
                          <p className="text-xs text-fog-400 mb-1">
                            Last reflection —{" "}
                            {new Date(reflections[0].created_at).toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                            })}
                          </p>
                          <p className="text-sm italic text-fog-700 dark:text-fog-400 border-l-2 border-fog-400 pl-3">
                            {reflections[0].content}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-fog-700 border border-fog-200 dark:border-fog-700 rounded-lg p-4 flex flex-col items-center gap-3 py-6">
                      <p className="text-sm text-fog-400 text-center">
                        No summary yet. Select a time window above and generate a pre-session brief.
                      </p>
                      <button
                        onClick={handleGenerate}
                        className="text-sm bg-fog-700 dark:bg-fog-200 hover:bg-fog-900 dark:hover:bg-fog-400 text-fog-50 dark:text-fog-900 font-medium px-5 py-2 rounded-lg transition-colors"
                      >
                        Generate Pre-Session Summary
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "reflections" && (
              <div className="flex flex-col gap-3 p-4">
                {reflections.length === 0 ? (
                  <p className="text-fog-400">No reflections yet.</p>
                ) : (
                  reflections.map((r) => <ReflectionCard key={r.id} reflection={r} />)
                )}
              </div>
            )}

            {tab === "notes" && (
              <div className="p-4">
                <SessionNotes patientId={patientId} patientName={patientName ?? "Unknown"} />
              </div>
            )}

            {tab === "soap" && (
              <div className="p-4">
                <SOAPNotesSection patientId={patientId} patientName={patientName ?? "Unknown"} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PatientTimeline;
