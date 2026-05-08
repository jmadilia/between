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
      {/* Convert patients into a list of buttons*/}
      {patients.map((patient) => (
        <button
          key={patient.id}
          onClick={() => onSelectPatient(patient.id)}
          className={`text-left px-4 py-3 rounded-lg cursor-pointer ${
            selectedPatientId === patient.id
              ? "bg-blue-100 text-blue-900"
              : "hover:bg-gray-100 text-gray-700"
          }`}>
          <div>{patient.name}</div>
          <div>{patient.role}</div>
        </button>
      ))}
    </div>
  );
}

export default PatientList;
