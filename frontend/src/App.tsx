import { useState, useEffect } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ReflectionForm from "./components/reflection-form";
import PersonaProvider from "./components/persona-provider";
import RequirePersona from "./components/require-persona";
import TherapistDashboard from "./pages/TherapistDashboard";
import OnboardingFlow from "./pages/OnboardingFlow";
import Landing from "./pages/Landing";
import { resetDemo } from "./api";
import { usePersona } from "./persona";

function Header({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const navigate = useNavigate();
  const { persona, signOut, refresh } = usePersona();
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    if (!window.confirm("Reset the demo? This restores the original patients and removes anything added since.")) {
      return;
    }
    setResetting(true);
    try {
      await resetDemo();
      // Leave the current page first so it doesn't re-pick a persona mid-reset.
      navigate("/");
      signOut();
      await refresh();
    } catch {
      window.alert("Couldn't reset the demo. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  function switchRole() {
    navigate("/");
    signOut();
  }

  const buttonClass =
    "text-xs rounded-full border border-fog-200 dark:border-fog-700 px-3 py-1.5 text-fog-700 dark:text-fog-200 hover:border-fog-400 disabled:opacity-50 transition-colors";

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-fog-200 dark:border-fog-700 bg-fog-50 dark:bg-fog-900">
      <Link to="/" className="text-base font-semibold text-fog-900 dark:text-fog-50">
        Between
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        {persona && (
          <span className="text-xs text-fog-700 dark:text-fog-200 mr-1">
            Viewing as <span className="font-medium text-fog-900 dark:text-fog-50">{persona.name}</span>
            <span className="text-fog-400"> · {persona.role === "therapist" ? "Therapist" : "Patient"}</span>
          </span>
        )}
        {persona && (
          <button onClick={switchRole} className={buttonClass}>
            Switch role
          </button>
        )}
        <button onClick={handleReset} disabled={resetting} className={buttonClass}>
          {resetting ? "Resetting…" : "Reset demo"}
        </button>
        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="w-8 h-8 flex items-center justify-center rounded-full border border-fog-200 dark:border-fog-700 bg-white dark:bg-fog-700 hover:opacity-80 text-sm transition-opacity"
        >
          {isDark ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <BrowserRouter>
      <PersonaProvider>
        <div className="min-h-screen flex flex-col bg-fog-50 dark:bg-fog-900">
          <Header isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

          <main className="flex-1 flex flex-col min-h-0">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/patient"
                element={
                  <RequirePersona role="patient">
                    <ReflectionForm />
                  </RequirePersona>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <RequirePersona role="patient">
                    <OnboardingFlow />
                  </RequirePersona>
                }
              />
              <Route
                path="/therapist"
                element={
                  <RequirePersona role="therapist">
                    <TherapistDashboard />
                  </RequirePersona>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </PersonaProvider>
    </BrowserRouter>
  );
}

export default App;
