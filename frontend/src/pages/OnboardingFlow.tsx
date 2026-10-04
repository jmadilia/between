import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  saveOnboardingProfile,
  saveOnboardingScreener,
  saveOnboardingConsent,
  type ScreenerResult,
} from "../api";
import { usePersona } from "../persona";

// --- PHQ-9 ---
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed — or being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

// --- GAD-7 ---
const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const RESPONSE_LABELS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

// --- Shared screener question renderer ---
type ScreenerFormProps = {
  title: string;
  subtitle: string;
  questions: string[];
  responses: number[];
  onChange: (index: number, value: number) => void;
};

function ScreenerForm({ title, subtitle, questions, responses, onChange }: ScreenerFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-fog-900 dark:text-fog-50 mb-1">{title}</h2>
        <p className="text-sm text-fog-400">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-5">
        {questions.map((q, i) => (
          <div key={i} className="flex flex-col gap-2">
            <p className="text-sm text-fog-900 dark:text-fog-50">
              <span className="text-fog-400 mr-2">{i + 1}.</span>
              {q}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RESPONSE_LABELS.map((label, val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange(i, val)}
                  className={`text-xs rounded-lg border py-2 px-1 text-center transition-colors ${
                    responses[i] === val
                      ? "bg-fog-700 dark:bg-fog-200 border-fog-700 dark:border-fog-200 text-fog-50 dark:text-fog-900 font-medium"
                      : "border-fog-200 dark:border-fog-600 text-fog-700 dark:text-fog-200 bg-white dark:bg-fog-800 hover:border-fog-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Step indicator ---
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < current
              ? "w-6 bg-fog-700 dark:bg-fog-200"
              : i === current
              ? "w-6 bg-fog-400"
              : "w-4 bg-fog-200 dark:bg-fog-600"
          }`}
        />
      ))}
    </div>
  );
}

// --- Main flow ---
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { persona, refresh } = usePersona();
  const PATIENT_ID = persona!.id;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 0 — Profile
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Step 1 — Presenting concerns + goals
  const [presentingConcerns, setPresentingConcerns] = useState("");
  const [goals, setGoals] = useState(["", "", ""]);

  // Step 2 — PHQ-9
  const [phq9, setPhq9] = useState<number[]>(Array(9).fill(-1));
  const [phq9Result, setPhq9Result] = useState<ScreenerResult | null>(null);

  // Step 3 — GAD-7
  const [gad7, setGad7] = useState<number[]>(Array(7).fill(-1));

  // Step 4 — Consent
  const [consentChecked, setConsentChecked] = useState(false);

  const TOTAL_STEPS = 5;

  function updateGoal(index: number, value: string) {
    setGoals((prev) => prev.map((g, i) => (i === index ? value : g)));
  }

  function updatePhq9(index: number, value: number) {
    setPhq9((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function updateGad7(index: number, value: number) {
    setGad7((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  async function handleNext() {
    setError(null);
    setSaving(true);
    try {
      if (step === 0) {
        await saveOnboardingProfile({
          patient_id: PATIENT_ID,
          date_of_birth: dateOfBirth || null,
          pronouns: pronouns || null,
          emergency_contact_name: emergencyName || null,
          emergency_contact_phone: emergencyPhone || null,
          presenting_concerns: null,
          goals: null,
        });
        setStep(1);
      } else if (step === 1) {
        const goalsText = goals.filter((g) => g.trim()).join("\n");
        await saveOnboardingProfile({
          patient_id: PATIENT_ID,
          date_of_birth: dateOfBirth || null,
          pronouns: pronouns || null,
          emergency_contact_name: emergencyName || null,
          emergency_contact_phone: emergencyPhone || null,
          presenting_concerns: presentingConcerns || null,
          goals: goalsText || null,
        });
        setStep(2);
      } else if (step === 2) {
        if (phq9.some((v) => v === -1)) {
          setError("Please answer all questions before continuing.");
          return;
        }
        const result = await saveOnboardingScreener({
          patient_id: PATIENT_ID,
          screener_type: "phq9",
          responses: phq9,
        });
        setPhq9Result(result);
        setStep(3);
      } else if (step === 3) {
        if (gad7.some((v) => v === -1)) {
          setError("Please answer all questions before continuing.");
          return;
        }
        await saveOnboardingScreener({
          patient_id: PATIENT_ID,
          screener_type: "gad7",
          responses: gad7,
        });
        setStep(4);
      } else if (step === 4) {
        if (!consentChecked) {
          setError("Please review and acknowledge the consent statement to continue.");
          return;
        }
        await saveOnboardingConsent(PATIENT_ID);
        await refresh();
        navigate("/patient");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const stepLabels = ["Profile", "Your concerns", "PHQ-9", "GAD-7", "Consent"];

  return (
    <div className="flex-1 bg-fog-50 dark:bg-fog-900 flex items-start justify-center p-4 pt-10">
      <div className="bg-white dark:bg-fog-700 rounded-xl shadow-sm border border-fog-200 dark:border-fog-700 w-full max-w-lg p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-fog-400">{stepLabels[step]}</span>
          <StepIndicator current={step} total={TOTAL_STEPS} />
        </div>

        {/* Step 0 — Profile */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-fog-900 dark:text-fog-50 mb-1">Let's get started</h2>
              <p className="text-sm text-fog-400">A few basics help your therapist prepare for your first session.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-fog-900 dark:text-fog-50">Date of birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="border border-fog-200 dark:border-fog-600 rounded-lg p-2.5 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-800 focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-fog-900 dark:text-fog-50">Pronouns <span className="text-fog-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. she/her, he/him, they/them"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  className="border border-fog-200 dark:border-fog-600 rounded-lg p-2.5 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-800 placeholder-fog-400 focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-fog-900 dark:text-fog-50">Emergency contact name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="border border-fog-200 dark:border-fog-600 rounded-lg p-2.5 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-800 placeholder-fog-400 focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-fog-900 dark:text-fog-50">Emergency contact phone</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="border border-fog-200 dark:border-fog-600 rounded-lg p-2.5 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-800 placeholder-fog-400 focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Presenting concerns + goals */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-fog-900 dark:text-fog-50 mb-1">What brings you here?</h2>
              <p className="text-sm text-fog-400">This helps your therapist understand your starting point before your first session.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-fog-900 dark:text-fog-50">Presenting concerns</label>
              <textarea
                rows={4}
                placeholder="Describe what's been on your mind, any symptoms you've been experiencing, or what prompted you to seek therapy..."
                value={presentingConcerns}
                onChange={(e) => setPresentingConcerns(e.target.value)}
                className="border border-fog-200 dark:border-fog-600 rounded-lg p-2.5 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-800 placeholder-fog-400 resize-none focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-fog-900 dark:text-fog-50">Therapy goals <span className="text-fog-400 font-normal">(up to 3)</span></label>
              {goals.map((goal, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Goal ${i + 1}`}
                  value={goal}
                  onChange={(e) => updateGoal(i, e.target.value)}
                  className="border border-fog-200 dark:border-fog-600 rounded-lg p-2.5 text-sm text-fog-900 dark:text-fog-50 bg-fog-50 dark:bg-fog-800 placeholder-fog-400 focus:outline-none focus:ring-2 focus:ring-fog-200 dark:focus:ring-fog-500"
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — PHQ-9 */}
        {step === 2 && (
          <ScreenerForm
            title="Depression screening (PHQ-9)"
            subtitle="Over the last 2 weeks, how often have you been bothered by any of the following?"
            questions={PHQ9_QUESTIONS}
            responses={phq9}
            onChange={updatePhq9}
          />
        )}

        {/* Step 3 — GAD-7 — includes crisis message if PHQ-9 item 9 was flagged */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            {phq9Result?.crisis_flag && (
              <div className="rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950 p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                  Your response to question 9 has been noted
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Your therapist will follow up on this in your first session. If you're in crisis right now, please contact the{" "}
                  <strong>988 Suicide & Crisis Lifeline</strong> by calling or texting <strong>988</strong>.
                </p>
              </div>
            )}
            <ScreenerForm
              title="Anxiety screening (GAD-7)"
              subtitle="Over the last 2 weeks, how often have you been bothered by any of the following?"
              questions={GAD7_QUESTIONS}
              responses={gad7}
              onChange={updateGad7}
            />
          </div>
        )}

        {/* Step 4 — Consent */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-fog-900 dark:text-fog-50 mb-1">Before you begin</h2>
              <p className="text-sm text-fog-400">Please review what your therapist can see and how this tool works.</p>
            </div>

            <div className="flex flex-col gap-3 text-sm text-fog-700 dark:text-fog-200">
              <div className="rounded-lg border border-fog-200 dark:border-fog-600 bg-fog-50 dark:bg-fog-800 p-4 flex flex-col gap-2">
                <p className="font-medium text-fog-900 dark:text-fog-50">What your therapist sees</p>
                <ul className="list-disc list-inside space-y-1 text-fog-600 dark:text-fog-300">
                  <li>Your intake profile (DOB, pronouns, emergency contact)</li>
                  <li>Your presenting concerns and therapy goals</li>
                  <li>Your PHQ-9 and GAD-7 screener scores</li>
                  <li>All between-session reflections you submit</li>
                  <li>Session notes and clinical documentation they write</li>
                </ul>
              </div>

              <div className="rounded-lg border border-fog-200 dark:border-fog-600 bg-fog-50 dark:bg-fog-800 p-4 flex flex-col gap-2">
                <p className="font-medium text-fog-900 dark:text-fog-50">How between-session reflections work</p>
                <p className="text-fog-600 dark:text-fog-300">
                  After your sessions, you'll be able to log how you're feeling — mood, symptom severity, and a short journal entry. These check-ins help your therapist prepare for each session.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-fog-700 dark:accent-fog-200 shrink-0"
              />
              <span className="text-sm text-fog-700 dark:text-fog-200">
                I understand what information is shared with my therapist and how Between works.
              </span>
            </label>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => { setError(null); setStep((s) => s - 1); }}
              className="text-sm text-fog-700 dark:text-fog-200 hover:underline"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="bg-fog-700 dark:bg-fog-200 hover:bg-fog-900 dark:hover:bg-fog-400 disabled:opacity-50 text-fog-50 dark:text-fog-900 text-sm font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            {saving ? "Saving..." : step === TOTAL_STEPS - 1 ? "Finish" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
