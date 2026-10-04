import { createContext, useContext } from "react";
import type { Persona } from "./api";

export type PersonaContextValue = {
  persona: Persona | null;
  personas: Persona[];
  loading: boolean;
  /** Set when the API can't be reached, so pages can explain instead of spinning. */
  error: string | null;
  signInAs: (persona: Persona) => void;
  signOut: () => void;
  refresh: () => Promise<Persona[]>;
};

export const PersonaContext = createContext<PersonaContextValue | null>(null);

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used inside <PersonaProvider>");
  return ctx;
}
