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
  summary: string[];
};

export type ReflectionPayload = {
  patient_id: number;
  content: string;
  mood: number;
  symptom_severity: number;
};

export async function submitReflection(data: ReflectionPayload) {
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

export async function getInsights(patientId: number): Promise<Insights> {
  const response = await api.get(`/insights/${patientId}`);
  return response.data;
}
