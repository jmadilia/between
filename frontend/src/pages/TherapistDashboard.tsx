import { useSearchParams } from "react-router-dom";
import PatientList from "../components/patient-list";
import PatientTimeline from "../components/patient-timeline";
import { usePersona } from "../persona";

function TherapistDashboard() {
  const { personas } = usePersona();
  const [searchParams, setSearchParams] = useSearchParams();
  const patients = personas.filter((p) => p.role === "patient");

  // Open on a patient right away (the one in the URL, else the first) so the
  // dashboard never starts as an empty panel.
  const requestedId = Number(searchParams.get("patient"));
  const selected = patients.find((p) => p.id === requestedId) ?? patients[0] ?? null;

  function handleSelectPatient(id: number) {
    setSearchParams({ patient: String(id) }, { replace: true });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 min-h-0 overflow-hidden bg-fog-50 dark:bg-fog-900">
      <div className="lg:col-span-1 bg-white dark:bg-fog-900 border-r border-fog-200 dark:border-fog-700 overflow-y-auto">
        <PatientList
          selectedPatientId={selected?.id ?? null}
          onSelectPatient={handleSelectPatient}
        />
      </div>
      <div className="lg:col-span-3 bg-fog-50 dark:bg-fog-900 flex flex-col min-h-0">
        <PatientTimeline
          key={selected?.id ?? "none"}
          patientId={selected?.id ?? null}
          patientName={selected?.name ?? null}
        />
      </div>
    </div>
  );
}

export default TherapistDashboard;
