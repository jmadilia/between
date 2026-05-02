import { useState } from "react";
import { submitReflection } from "../api";

function PatientForm() {
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState(3);
  const [symptomSeverity, setSymptomSeverity] = useState(3);

  const PATIENT_ID = 1;

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    await submitReflection({
      patient_id: PATIENT_ID,
      content: reflection,
      mood,
      symptom_severity: symptomSeverity,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="How have you been feeling since your last session?"
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}></textarea>
      <label>
        Mood ({mood}/5)
        <input
          type="range"
          min={1}
          max={5}
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}></input>
      </label>
      <span>{mood}</span>
      <label>
        Symptom Severity ({symptomSeverity}/5)
        <input
          type="range"
          min={1}
          max={5}
          value={symptomSeverity}
          onChange={(e) => setSymptomSeverity(Number(e.target.value))}></input>
      </label>
      <span>{symptomSeverity}</span>

      <button type="submit">Submit</button>
    </form>
  );
}

export default PatientForm;
