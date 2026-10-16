import { useEffect, useState } from "react";

import {
  ShieldAlert,
  GraduationCap,
  FileCheck2,
  ClipboardList,
  Clock3,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/dashboard/StatCard";
import IncidentTrendChart from "../components/dashboard/IncidentTrendChart";
import ViolationsByCollegeChart from "../components/dashboard/ViolationsByCollegeChart";
import RecentOperationalRecords from "../components/dashboard/RecentOperationalRecords";
import StudentDashboard from "../components/dashboard/StudentDashboard";

import { useAuth } from "../contexts/useAuth";

import {
  getDashboardOverview,
  type DashboardOverview,
} from "../services/dashboardService";

import "../styles/dashboard.css";

function OperationalDashboard({
  token,
  role,
}: {
  token: string;
  role: "admin" | "staff";
}) {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      setOverview(null);

      try {
        const data = await getDashboardOverview(token, controller.signal);

        if (!controller.signal.aborted) {
          setOverview(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load dashboard data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      controller.abort();
    };
  }, [token]);

  const userRole = role === "admin" ? "Administrator" : "Security Staff";

  return (
    <div className="coms-dashboard">
      {/* Dashboard heading */}
      <div className="coms-dashboard-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Monitor campus security operations and activities.</p>
        </div>

        <div className="coms-dashboard-header-actions">
          <span className="coms-dashboard-sync-status" role="status">
            <Clock3 size={15} aria-hidden="true" />

            {isLoading
              ? "Loading dashboard..."
              : error
                ? "Data unavailable"
                : overview?.data_available
                  ? "Dashboard data loaded"
                  : "Awaiting operational data"}
          </span>

          <span className="coms-dashboard-role">{userRole}</span>
        </div>
      </div>

      {/* API error message */}
      {error && (
        <div role="alert" className="coms-dashboard-error">
          {error}
        </div>
      )}

      {/* Dashboard summary cards */}
      <section
        className="coms-dashboard-summary"
        aria-label="Dashboard summary"
      >
        <div className="incident-stat-container">
          <div className="incident-stat-card">
            <StatCard
              title="Security Incidents"
              value={overview?.summary.security_incidents ?? null}
              description="Recorded security incidents"
              icon={ShieldAlert}
              color="red"
            />

            {overview?.incident_status_counts && (
              <div className="incident-status-summary">
                <div>
                  <span>Open</span>
                  <strong>{overview.incident_status_counts.open}</strong>
                </div>

                <div>
                  <span>Under Investigation</span>
                  <strong>
                    {overview.incident_status_counts.under_investigation}
                  </strong>
                </div>

                <div>
                  <span>Resolved</span>
                  <strong>{overview.incident_status_counts.resolved}</strong>
                </div>

                <div>
                  <span>Closed</span>
                  <strong>{overview.incident_status_counts.closed}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <StatCard
          title="Student Violations"
          value={overview?.summary.student_violations ?? null}
          description="Recorded student violations"
          icon={GraduationCap}
          color="yellow"
        />

        <StatCard
          title="Gate Pass Verifications"
          value={overview?.summary.gate_pass_verifications ?? null}
          description="Verified gate pass records"
          icon={FileCheck2}
          color="blue"
        />

        <StatCard
          title="Service Requests"
          value={overview?.summary.service_requests ?? null}
          description="Security service requests"
          icon={ClipboardList}
          color="green"
        />
      </section>

      {/* Dashboard analytics */}
      <section
        className="coms-dashboard-analytics"
        aria-label="Dashboard analytics"
      >
        <IncidentTrendChart data={overview?.incident_trends ?? []} />

        <ViolationsByCollegeChart
          data={overview?.violations_by_college ?? []}
        />
      </section>

      {/* Recent operational records */}
      <RecentOperationalRecords
        records={overview?.recent_operational_records ?? []}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user, token } = useAuth();

  if (user?.role === "user_student") {
    return (
      <AppLayout>
        <StudentDashboard />
      </AppLayout>
    );
  }

  if (!user || !token || (user.role !== "admin" && user.role !== "staff")) {
    return null;
  }

  return (
    <AppLayout>
      <OperationalDashboard token={token} role={user.role} />
    </AppLayout>
  );
}
