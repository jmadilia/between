import { type Reflection } from "../api";

type Props = {
  reflection: Reflection;
};

function moodColor(mood: number): string {
  const colors: Record<number, string> = {
    1: "bg-red-500",
    2: "bg-orange-400",
    3: "bg-yellow-400",
    4: "bg-lime-400",
    5: "bg-green-500",
  };
  return colors[mood] ?? "bg-gray-300";
}

function ReflectionCard({ reflection }: Props) {
  const reflectionDate = new Date(reflection.created_at).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <div className="bg-white dark:bg-fog-700 border border-fog-200 dark:border-fog-700 rounded-lg p-4 flex flex-col gap-2">
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${moodColor(reflection.mood)}`}
          />
          <span className="text-sm text-fog-400">{reflectionDate}</span>
        </div>
        <p className="text-xs text-fog-400">
          Severity: {reflection.symptom_severity}/5
        </p>
        <p className="text-fog-900 dark:text-fog-50">{reflection.content}</p>
      </div>
    </div>
  );
}

export default ReflectionCard;
