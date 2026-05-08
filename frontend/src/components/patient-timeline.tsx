import { useState, useEffect } from "react";
import {
  type Reflection,
  type Insights,
  getReflections,
  getInsights,
} from "../api";
import ReflectionCard from "./reflection-card";

type Props = {
  patientId: number | null;
};

function PatientTimeline({ patientId }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patientId === null) return;

    setLoading(true);
    Promise.all([getReflections(patientId), getInsights(patientId)]).then(
      ([reflectionData, insightData]) => {
        const sorted = [...reflectionData].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setReflections(sorted);
        setInsights(insightData);
        setLoading(false);
      },
    );
  }, [patientId]);

  if (patientId === null) {
    return (
      <p className="text-gray-400 p-4">
        Select a patient to view their timeline.
      </p>
    );
  }

  if (loading) {
    return <p className="text-gray-400 p-4">Loading...</p>;
  }

  return (
    <div>
      {/* Display insights */}
      {insights && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col gap-2">
          <p className="text-sm text-gray-700">{insights.summary}</p>
          {insights.trends.length > 0 && (
            <ul className="text-xs text-blue-700 list-disc list-inside">
              {insights.trends.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
          {insights.flags.length > 0 && (
            <ul className="text-xs text-orange-600 list-disc list-inside">
              {insights.flags.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {reflections.length === 0 ? (
        <p className="text-gray-400">No reflections yet.</p>
      ) : (
        reflections.map((r) => <ReflectionCard key={r.id} reflection={r} />)
      )}
    </div>
  );
}

export default PatientTimeline;
