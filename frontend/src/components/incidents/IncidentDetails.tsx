import { CalendarDays, MapPin, ShieldAlert, UserRound } from "lucide-react";

import type { SecurityIncident } from "../../services/incidentService";

type IncidentDetailsProps = {
  incident: SecurityIncident;
};

function formatDate(value: string): string {
  if (!value) return "—";

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return value;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  const date = new Date(year, month - 1, day, hour, minute);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClass(status: string): string {
  switch (status) {
    case "open":
      return "coms-record-status-open";
    case "under_investigation":
      return "coms-record-status-investigation";
    case "resolved":
      return "coms-record-status-resolved";
    case "closed":
      return "coms-record-status-closed";
    default:
      return "coms-record-status-default";
  }
}

export default function IncidentDetails({ incident }: IncidentDetailsProps) {
  return (
    <article className="coms-incident-details">
      <div className="coms-incident-details-header">
        <div>
          <span className="coms-incident-reference">
            {incident.incident_number}
          </span>

          <h2>{incident.title}</h2>
          <p>{incident.incident_type}</p>
        </div>

        <span
          className={`coms-record-status ${getStatusClass(incident.status)}`}
        >
          {formatStatus(incident.status)}
        </span>
      </div>

      <section className="coms-incident-details-section">
        <h3>Incident Information</h3>

        <div className="coms-incident-details-grid">
          <div className="coms-incident-detail-field">
            <span>
              <MapPin size={15} aria-hidden="true" />
              Location
            </span>
            <strong>{incident.location}</strong>
          </div>

          <div className="coms-incident-detail-field">
            <span>
              <CalendarDays size={15} aria-hidden="true" />
              Date and Time of Incident
            </span>
            <strong>{formatDate(incident.occurred_at)}</strong>
          </div>

          <div className="coms-incident-detail-field">
            <span>
              <CalendarDays size={15} aria-hidden="true" />
              Date Reported
            </span>
            <strong>{formatDate(incident.reported_at)}</strong>
          </div>

          <div className="coms-incident-detail-field">
            <span>
              <UserRound size={15} aria-hidden="true" />
              Reported By
            </span>
            <strong>User #{incident.reported_by_id}</strong>
          </div>
        </div>
      </section>

      <section className="coms-incident-details-section">
        <h3>Incident Description</h3>

        <p className="coms-incident-description">{incident.description}</p>
      </section>

      <section className="coms-incident-details-section">
        <h3>Resolution Notes</h3>

        {incident.resolution_notes ? (
          <p className="coms-incident-description">
            {incident.resolution_notes}
          </p>
        ) : (
          <p className="coms-incident-details-placeholder">
            No resolution notes have been recorded.
          </p>
        )}
      </section>

      <div className="coms-incident-details-footer">
        <ShieldAlert size={16} aria-hidden="true" />
        <span>
          This incident report is maintained by the Civil Security Services
          Unit.
        </span>
      </div>
    </article>
  );
}
