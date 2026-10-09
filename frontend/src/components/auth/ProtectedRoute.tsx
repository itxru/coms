import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../contexts/useAuth";
import type { UserRole } from "../../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { user, status, isAuthenticated } = useAuth();

  // Prevent protected content from appearing while
  // authentication is being processed.
  if (status === "loading") {
    return <p>Verifying your session...</p>;
  }

  // Redirect unauthenticated users to the login page.
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check whether the authenticated user's role
  // is permitted to access this route.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // Render the protected child route.
  return <Outlet />;
}
