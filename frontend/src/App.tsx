import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./App.css";
import ReflectionForm from "./components/reflection-form";
import TherapistDashboard from "./pages/TherapistDashboard";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/patient">Patient</Link>
        <Link to="/therapist">Therapist</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ReflectionForm />} />
        <Route path="/patient" element={<ReflectionForm />} />
        <Route path="/therapist" element={<TherapistDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

