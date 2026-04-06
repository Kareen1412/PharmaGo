import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PharmacySignupPage from "./pages/pharmacySignup";
import PharmacyLoginPage from "./pages/pharmacyLogin";
import PharmacyDashboardPage from "./pages/pharmacyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    
      <Routes>
        <Route path="/signup" element={<PharmacySignupPage />} />
        <Route path="/login" element={<PharmacyLoginPage />} />
        <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PharmacyDashboardPage />
          </ProtectedRoute>
        }
      />
      </Routes>
  
  );
}

export default App;