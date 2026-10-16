import { History } from "lucide-react";
import type { IncidentAuditLog } from "../../services/incidentService";

interface IncidentAuditHistoryProps {
  logs: IncidentAuditLog[];
  isLoading: boolean;
  error: string | null;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string") {
    return value || "—";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

export default function IncidentAuditHistory({
  logs,
  isLoading,
  error,
}: IncidentAuditHistoryProps) {
  return (
    <section className="coms-incident-details-section">
      <h3>Audit History</h3>

      {isLoading ? (
        <p className="coms-incident-details-placeholder">
          Loading audit history...
        </p>
      ) : error ? (
        <p role="alert" className="coms-dashboard-error">
          {error}
        </p>
      ) : logs.length === 0 ? (
        <p className="coms-incident-details-placeholder">
          No audit history is available for this incident.
        </p>
      ) : (
        <div className="coms-incident-audit-list">
          {logs.map((log) => (
            <article key={log.id} className="coms-incident-audit-entry">
              <div className="coms-incident-audit-heading">
                <History size={16} aria-hidden="true" />

                <strong>{formatLabel(log.action)}</strong>

                <span>{formatDate(log.created_at)}</span>
              </div>

              <p>Performed by User #{log.performed_by_id}</p>

              {Object.entries(log.changes).map(([field, change]) => (
                <div key={field} className="coms-incident-audit-change">
                  <strong>{formatLabel(field)}</strong>

                  {change !== null &&
                  typeof change === "object" &&
                  "old" in change &&
                  "new" in change ? (
                    <p>
                      {formatValue(change.old)} → {formatValue(change.new)}
                    </p>
                  ) : (
                    <p>{formatValue(change)}</p>
                  )}
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
