import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PharmacySignupPage from "./pages/pharmacySignup";
import PharmacyLoginPage from "./pages/pharmacyLogin";
import PharmacyDashboardPage from "./pages/pharmacyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PharmacyVerificationPage from "./pages/pharmacyVerification";
import PharmacyProfilePage from "./pages/pharmacyProfile";

function App() {
  return (
    
      <Routes>
        <Route path="/signup" element={<PharmacySignupPage />} />
        <Route path="/login" element={<PharmacyLoginPage />} />
        <Route
        path="/"
        element={
          <ProtectedRoute>
            <PharmacyDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PharmacyProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/verification"
        element={
          <ProtectedRoute>
            <PharmacyVerificationPage />
          </ProtectedRoute>
        }
      />
      </Routes>
  
  );
}

export default App;