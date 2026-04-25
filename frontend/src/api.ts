import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export type ReflectionPaylod = {
  patient_id: number;
  content: string;
  mood: number;
  symptom_severity: number;
};

export async function submitReflection(data: ReflectionPaylod) {
  const response = await api.post("/reflections/", data);
  return response.data;
}
