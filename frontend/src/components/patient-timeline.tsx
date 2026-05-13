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

type Props = {
  patientId: number | null;
};

const WINDOWS: { label: string; value: InsightWindow }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
];

function PatientTimeline({ patientId }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [window, setWindow] = useState<InsightWindow>("all");
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (patientId === null) return;
    setLoadingReflections(true);
    getReflections(patientId).then((data) => {
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setReflections(sorted);
      setLoadingReflections(false);
    });
  }, [patientId]);

  useEffect(() => {
    if (patientId === null) return;
    setLoadingInsights(true);
    setInsights(null);
    getInsights(patientId, window).then((data) => {
      setInsights(data);
      setLoadingInsights(false);
    });
  }, [patientId, window]);

  if (patientId === null) {
    return (
      <p className="text-fog-400 p-4">Select a patient to view their timeline.</p>
    );
  }

  if (loadingReflections) {
    return <p className="text-fog-400 p-4">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {reflections.length > 0 && <MoodChart reflections={reflections} />}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fog-400">Insights</span>
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

        {loadingInsights ? (
          <div className="bg-white dark:bg-fog-700 border border-fog-200 dark:border-fog-700 rounded-lg p-4">
            <p className="text-sm text-fog-400">Generating insights...</p>
          </div>
        ) : insights && (
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
            {reflections.length > 0 && (
              <div className="mt-2 border-t border-fog-200 dark:border-fog-700 pt-2">
                <p className="text-xs text-fog-400 mb-1">
                  Last reflection —{" "}
                  {new Date(reflections[0].created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm italic text-fog-700 dark:text-fog-400 border-l-2 border-fog-400 pl-3">
                  {reflections[0].content}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <SessionNotes patientId={patientId} />

      {reflections.length === 0 ? (
        <p className="text-fog-400">No reflections yet.</p>
      ) : (
        reflections.map((r) => <ReflectionCard key={r.id} reflection={r} />)
      )}
    </div>
  );
}

export default PatientTimeline;
