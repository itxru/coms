import type { IncidentTrendData } from "../components/dashboard/IncidentTrendChart";
import type { ViolationCollegeData } from "../components/dashboard/ViolationsByCollegeChart";
import type { OperationalRecord } from "../components/dashboard/RecentOperationalRecords";

export interface IncidentStatusCounts {
  open: number;
  under_investigation: number;
  resolved: number;
  closed: number;
}

export type DashboardSummary = {
  security_incidents: number | null;
  student_violations: number | null;
  gate_pass_verifications: number | null;
  service_requests: number | null;
};

export type DashboardOverview = {
  data_available: boolean;
  summary: DashboardSummary;
  incident_trends: IncidentTrendData[];
  violations_by_college: ViolationCollegeData[];
  recent_operational_records: OperationalRecord[];
  incident_status_counts: IncidentStatusCounts;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export async function getDashboardOverview(
  token: string,
  signal?: AbortSignal,
): Promise<DashboardOverview> {
  const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load dashboard overview (HTTP ${response.status})`,
    );
  }

  return (await response.json()) as DashboardOverview;
}
