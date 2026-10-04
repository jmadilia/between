import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { type Persona, getPersonas, setCurrentUserId } from "../api";
import { PersonaContext } from "../persona";

const STORAGE_KEY = "between.persona";

function loadStored(): Persona | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persona) : null;
  } catch {
    return null;
  }
}

function store(persona: Persona | null) {
  try {
    if (persona) localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode); the persona just won't survive a reload.
  }
}

function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona | null>(() => {
    const stored = loadStored();
    setCurrentUserId(stored?.id ?? null);
    return stored;
  });
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const personaRef = useRef(persona);

  const apply = useCallback((next: Persona | null) => {
    personaRef.current = next;
    setCurrentUserId(next?.id ?? null);
    store(next);
    setPersona(next);
  }, []);

  const signInAs = useCallback((next: Persona) => apply(next), [apply]);
  const signOut = useCallback(() => apply(null), [apply]);

  const refresh = useCallback(async () => {
    try {
      const list = await getPersonas();
      setPersonas(list);
      setError(null);
      // Keep the stored persona in sync (e.g. onboarding finished), and drop it
      // if the demo was reset and that user no longer exists.
      const current = personaRef.current;
      if (current) {
        apply(list.find((p) => p.id === current.id && p.role === current.role) ?? null);
      }
      return list;
    } catch {
      setError("The demo API isn't responding right now. Please try again in a moment.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch of the persona list
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ persona, personas, loading, error, signInAs, signOut, refresh }),
    [persona, personas, loading, error, signInAs, signOut, refresh],
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export default PersonaProvider;
