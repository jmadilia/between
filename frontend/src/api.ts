import axios from "axios";

// Same-origin "/api" works on Vercel (rewritten to the backend service) and in
// dev (proxied by Vite). Set VITE_API_URL only to point at a different host.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Demo identity: every request carries the persona the visitor picked.
let currentUserId: number | null = null;

export function setCurrentUserId(id: number | null) {
  currentUserId = id;
}

api.interceptors.request.use((config) => {
  if (currentUserId !== null) {
    config.headers.set("X-Demo-User-Id", String(currentUserId));
  }
  return config;
});

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export type Patient = {
  id: number;
  name: string;
  role: string;
};

export type Reflection = {
  id: number;
  patient_id: number;
  mood: number;
  symptom_severity: number;
  content: string;
  created_at: string;
};

export type Insights = {
  trends: string[];
  flags: string[];
  summary: string;
};

export type Note = {
  id: number;
  patient_id: number;
  therapist_id: number;
  content: string;
  session_date: string;
  created_at: string;
};

export type ReflectionPayload = {
  patient_id: number;
  content: string;
  mood: number;
  symptom_severity: number;
};

export type NotePayload = {
  patient_id: number;
  content: string;
  session_date: string;
};

export async function submitReflection(
  data: ReflectionPayload,
): Promise<Reflection> {
  const response = await api.post("/reflections/", data);
  return response.data;
}

export async function getPatients(): Promise<Patient[]> {
  const response = await api.get("/patients/");
  return response.data;
}

export async function getReflections(patientId: number): Promise<Reflection[]> {
  const response = await api.get(`/reflections/?patient_id=${patientId}`);
  return response.data;
}

export async function getInsights(
  patientId: number,
  fromDate?: string,
): Promise<Insights> {
  const params = fromDate ? `?from_date=${fromDate}` : "";
  const response = await api.get(`/insights/${patientId}${params}`);
  return response.data;
}

export async function getNotes(patientId: number): Promise<Note[]> {
  const response = await api.get(`/notes/?patient_id=${patientId}`);
  return response.data;
}

export async function createNote(data: NotePayload): Promise<Note> {
  const response = await api.post("/notes/", data);
  return response.data;
}

export type SOAPDraft = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export type SOAPNote = SOAPDraft & {
  id: number;
  patient_id: number;
  therapist_id: number;
  session_date: string;
  created_at: string;
};

export type SOAPNotePayload = SOAPDraft & {
  patient_id: number;
  session_date: string;
};

export async function generateSOAPDraft(
  patientId: number,
  sessionDate: string,
): Promise<SOAPDraft> {
  const response = await api.post("/soap-notes/generate", {
    patient_id: patientId,
    session_date: sessionDate,
  });
  return response.data;
}

export async function createSOAPNote(data: SOAPNotePayload): Promise<SOAPNote> {
  const response = await api.post("/soap-notes/", data);
  return response.data;
}

export async function getSOAPNotes(patientId: number): Promise<SOAPNote[]> {
  const response = await api.get(`/soap-notes/?patient_id=${patientId}`);
  return response.data;
}

export type DAPDraft = {
  data: string;
  assessment: string;
  plan: string;
};

export type DAPNote = DAPDraft & {
  id: number;
  patient_id: number;
  therapist_id: number;
  session_date: string;
  created_at: string;
};

export type DAPNotePayload = DAPDraft & {
  patient_id: number;
  session_date: string;
};

export async function generateDAPDraft(
  patientId: number,
  sessionDate: string,
): Promise<DAPDraft> {
  const response = await api.post("/dap-notes/generate", {
    patient_id: patientId,
    session_date: sessionDate,
  });
  return response.data;
}

export async function createDAPNote(data: DAPNotePayload): Promise<DAPNote> {
  const response = await api.post("/dap-notes/", data);
  return response.data;
}

export async function getDAPNotes(patientId: number): Promise<DAPNote[]> {
  const response = await api.get(`/dap-notes/?patient_id=${patientId}`);
  return response.data;
}

// --- Onboarding ---

export type OnboardingStatus = {
  patient_id: number;
  completed: boolean;
  profile_saved: boolean;
  screeners_saved: boolean;
  consent_given: boolean;
};

export type PatientProfilePayload = {
  patient_id: number;
  date_of_birth: string | null;
  pronouns: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  presenting_concerns: string | null;
  goals: string | null;
};

export type ScreenerPayload = {
  patient_id: number;
  screener_type: "phq9" | "gad7";
  responses: number[];
};

export type ScreenerResult = {
  id: number;
  patient_id: number;
  screener_type: string;
  responses: number[];
  total_score: number;
  severity_label: string;
  crisis_flag: boolean;
  created_at: string;
};

export type OnboardingData = {
  profile: PatientProfilePayload | null;
  screeners: ScreenerResult[];
};

export async function getOnboardingStatus(patientId: number): Promise<OnboardingStatus> {
  const response = await api.get(`/onboarding/status/${patientId}`);
  return response.data;
}

export async function saveOnboardingProfile(data: PatientProfilePayload): Promise<void> {
  await api.post("/onboarding/profile", data);
}

export async function saveOnboardingScreener(data: ScreenerPayload): Promise<ScreenerResult> {
  const response = await api.post("/onboarding/screener", data);
  return response.data;
}

export async function saveOnboardingConsent(patientId: number): Promise<void> {
  await api.post("/onboarding/consent", { patient_id: patientId });
}

export async function getOnboardingData(patientId: number): Promise<OnboardingData> {
  const response = await api.get(`/onboarding/${patientId}`);
  return response.data;
}

// --- Demo ---

export type Persona = {
  id: number;
  name: string;
  role: "patient" | "therapist";
  onboarding_completed: boolean;
};

export async function getPersonas(): Promise<Persona[]> {
  const response = await api.get("/demo/personas");
  return response.data;
}

export async function createDemoPatient(name?: string): Promise<Persona> {
  const response = await api.post("/demo/patients", { name: name ?? null });
  return response.data;
}

export async function resetDemo(): Promise<void> {
  await api.post("/demo/reset");
}
