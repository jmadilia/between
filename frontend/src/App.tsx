import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./App.css";
import PatientForm from "./components/reflection-form";
import TherapistDashboard from "./pages/TherapistDashboard";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/patient">Patient</Link>
        <Link to="/therapist">Therapist</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PatientForm />} />
        <Route path="/patient" element={<PatientForm />} />
        <Route path="/therapist" element={<TherapistDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

