import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, status, signOut } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main>
      <h1>COMS Dashboard</h1>
      <p>Welcome to the Campus Operations Management System.</p>

      <p>
        Logged in as: <strong>{user?.email}</strong>
      </p>

      <p>
        Role: <strong>{user?.role}</strong>
      </p>

      <p>
        Authentication Status: <strong>{status}</strong>
      </p>

      <nav aria-label="COMS test navigation">
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin">Admin Page</Link>
          </li>
          <li>
            <Link to="/staff">Staff Page</Link>
          </li>
          <li>
            <Link to="/student">Student Page</Link>
          </li>
        </ul>
      </nav>

      <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? "Signing out..." : "Logout"}
      </button>
    </main>
  );
}
