import { useState } from "react";
import PatientList from "../components/patient-list";
import PatientTimeline from "../components/patient-timeline";

function TherapistDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 h-screen">
      <div className="lg:col-span-1 border-r overflow-y-auto">
        <PatientList
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
        />
      </div>
      <div className="lg:col-span-3 overflow-y-auto">
        <PatientTimeline patientId={selectedPatientId} />
      </div>
    </div>
  );
}

export default TherapistDashboard;
