import { Routes, Route } from "react-router-dom";
import PharmacySignupPage from "./pages/pharmacySignup";
import PharmacyLoginPage from "./pages/pharmacyLogin";
import PharmacyDashboardPage from "./pages/pharmacyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PharmacyVerificationPage from "./pages/pharmacyVerification";
import PharmacyProfilePage from "./pages/pharmacyProfile";
import PharmacyLayout from "./components/PharmacyLayout";

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<PharmacySignupPage />} />
      <Route path="/login" element={<PharmacyLoginPage />} />
      <Route
          path="/dashboard/verification"
          element={<PharmacyVerificationPage />}
        />
      <Route
        element={
          <ProtectedRoute>
            <PharmacyLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<PharmacyDashboardPage />} />
        <Route path="/profile" element={<PharmacyProfilePage />} />
        
      </Route>
    </Routes>
  );
}

export default App;