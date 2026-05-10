import { Routes, Route } from "react-router-dom";
import PharmacySignupPage from "./pages/pharmacySignup";
import PharmacyLoginPage from "./pages/pharmacyLogin";
import PharmacyDashboardPage from "./pages/pharmacyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PharmacyVerificationPage from "./pages/pharmacyVerification";
import PharmacyProfilePage from "./pages/pharmacyProfile";
import PharmacyLayout from "./components/PharmacyLayout";
import PharmacyRequestsPage from "./pages/pharmacyRequests";
import PharmacyQuestionsPage from "./pages/PharmacyQuestionsPage";

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
        <Route path="/requests" element={<PharmacyRequestsPage />} />
        <Route path="/questions" element={<PharmacyQuestionsPage />} />
        
      </Route>
    </Routes>
  );
}

export default App;