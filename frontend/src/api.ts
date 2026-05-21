import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

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

export type InsightWindow = "week" | "month" | "year" | "all";

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
  window: InsightWindow = "all",
): Promise<Insights> {
  const response = await api.get(`/insights/${patientId}?window=${window}`);
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
