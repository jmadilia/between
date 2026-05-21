import { useState } from "react";
import PatientList from "../components/patient-list";
import PatientTimeline from "../components/patient-timeline";

function TherapistDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);

  function handleSelectPatient(id: number, name: string) {
    setSelectedPatientId(id);
    setSelectedPatientName(name);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 min-h-0 overflow-hidden bg-fog-50 dark:bg-fog-900">
      <div className="lg:col-span-1 bg-white dark:bg-fog-900 border-r border-fog-200 dark:border-fog-700 overflow-y-auto">
        <PatientList
          selectedPatientId={selectedPatientId}
          onSelectPatient={handleSelectPatient}
        />
      </div>
      <div className="lg:col-span-3 bg-fog-50 dark:bg-fog-900 flex flex-col min-h-0">
        <PatientTimeline patientId={selectedPatientId} patientName={selectedPatientName} />
      </div>
    </div>
  );
}

export default TherapistDashboard;
