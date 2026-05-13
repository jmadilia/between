import { useState, useEffect } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import ReflectionForm from "./components/reflection-form";
import TherapistDashboard from "./pages/TherapistDashboard";

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
      <div className="min-h-screen flex flex-col bg-fog-50 dark:bg-fog-900">
        <nav className="flex items-center justify-center gap-6 px-6 py-4 border-b border-fog-200 dark:border-fog-700 bg-fog-50 dark:bg-fog-900">
          <NavLink
            to="/patient"
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive
                  ? "text-fog-900 dark:text-fog-50 font-medium"
                  : "text-fog-700 dark:text-fog-400 hover:text-fog-900 dark:hover:text-fog-50"
              }`
            }>
            Patient
          </NavLink>
          <NavLink
            to="/therapist"
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive
                  ? "text-fog-900 dark:text-fog-50 font-medium"
                  : "text-fog-700 dark:text-fog-400 hover:text-fog-900 dark:hover:text-fog-50"
              }`
            }>
            Therapist
          </NavLink>
        </nav>

        <main className="flex-1 flex flex-col min-h-0">
          <Routes>
            <Route path="/" element={<ReflectionForm />} />
            <Route path="/patient" element={<ReflectionForm />} />
            <Route path="/therapist" element={<TherapistDashboard />} />
          </Routes>
        </main>

        <footer className="flex items-center justify-center py-3 border-t border-fog-200 dark:border-fog-700 bg-fog-50 dark:bg-fog-900">
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle dark mode"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-fog-200 dark:border-fog-700 bg-white dark:bg-fog-700 hover:opacity-80 text-base transition-opacity"
          >
            {isDark ? "🌙" : "☀️"}
          </button>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
