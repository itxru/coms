import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import StudentPage from "./pages/StudentPage";
import StaffPage from "./pages/StaffPage";
import AdminPage from "./pages/AdminPage";
import SecurityIncidentsPage from "./pages/SecurityIncidentsPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Accessible to all authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Security operations — Admin and Staff only */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
        <Route
          path="/operations/incidents"
          element={<SecurityIncidentsPage />}
        />
      </Route>

      {/* Admin-only routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* Staff-only routes */}
      <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
        <Route path="/staff" element={<StaffPage />} />
      </Route>

      {/* Student-only routes */}
      <Route element={<ProtectedRoute allowedRoles={["user_student"]} />}>
        <Route path="/student" element={<StudentPage />} />
      </Route>

      {/* Access denied */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
