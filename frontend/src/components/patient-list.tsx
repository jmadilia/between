import { useState, useEffect } from "react";
import { type Patient, getPatients } from "../api";

type Props = {
  selectedPatientId: number | null;
  onSelectPatient: (id: number) => void;
};

function PatientList({ selectedPatientId, onSelectPatient }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    getPatients().then(setPatients);
  }, []);

  return (
    <div>
      <p className="px-4 pt-4 pb-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-fog-400">Patients</p>
      {patients.map((patient) => (
        <button
          key={patient.id}
          onClick={() => onSelectPatient(patient.id)}
          className={`w-full text-left px-4 py-3 rounded-lg cursor-pointer ${
            selectedPatientId === patient.id
              ? "bg-fog-200 dark:bg-fog-700 text-fog-900 dark:text-fog-50"
              : "hover:bg-fog-50 dark:hover:bg-fog-700 text-fog-700 dark:text-fog-400"
          }`}>
          <div>{patient.name}</div>
        </button>
      ))}
    </div>
  );
}

export default PatientList;
