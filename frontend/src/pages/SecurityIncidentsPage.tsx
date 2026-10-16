import { useEffect, useState } from "react";
import { ClipboardList, Eye, Plus, Search, ShieldAlert, X } from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import IncidentDetails from "../components/incidents/IncidentDetails";
import IncidentAuditHistory from "../components/incidents/IncidentAuditHistory";
import IncidentForm, {
  type IncidentFormValues,
} from "../components/incidents/IncidentForm";
import { useAuth } from "../contexts/useAuth";
import {
  getSecurityIncidents,
  getSecurityIncidentById,
  getIncidentAuditHistory,
  createSecurityIncident,
  type SecurityIncident,
  type IncidentAuditLog,
} from "../services/incidentService";

function formatIncidentDate(value: string): string {
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

export default function SecurityIncidentsPage() {
  const { user, token } = useAuth();

  const [isIncidentFormOpen, setIsIncidentFormOpen] = useState(false);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [incidentFormError, setIncidentFormError] = useState<string | null>(
    null,
  );
  const [incidentSuccess, setIncidentSuccess] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreateIncident = user?.role === "staff";

  const filteredIncidents = incidents.filter((incident) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        incident.incident_number,
        incident.incident_type,
        incident.title,
        incident.location,
        incident.status.replace(/_/g, " "),
      ].some((value) => value.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "all" || incident.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(
    null,
  );
  const [selectedIncident, setSelectedIncident] =
    useState<SecurityIncident | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<IncidentAuditLog[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      // setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadIncidents() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getSecurityIncidents(token!, controller.signal);

        if (!controller.signal.aborted) {
          setIncidents(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load security incident records.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadIncidents();

    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (!token || selectedIncidentId === null) {
      return;
    }

    const controller = new AbortController();

    getSecurityIncidentById(token, selectedIncidentId, controller.signal)
      .then((incident) => {
        if (!controller.signal.aborted) {
          setSelectedIncident(incident);
          setIsDetailsLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setDetailsError("Unable to load incident details.");
          setIsDetailsLoading(false);
        }
      });

    return () => controller.abort();
  }, [token, selectedIncidentId]);

  useEffect(() => {
    if (selectedIncidentId === null || !token) {
      return;
    }

    const controller = new AbortController();

    getIncidentAuditHistory(token, selectedIncidentId, controller.signal)
      .then((logs) => {
        if (!controller.signal.aborted) {
          setAuditLogs(logs);
          setAuditError(null);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAuditError(
            error instanceof Error
              ? error.message
              : "Unable to load incident audit history.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsAuditLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedIncidentId, token]);

  function handleViewDetails(incidentId: number) {
    setSelectedIncident(null);
    setDetailsError(null);
    setIsDetailsLoading(true);

    setAuditLogs([]);
    setAuditError(null);
    setIsAuditLoading(true);

    setSelectedIncidentId(incidentId);
  }

  function handleCloseDetails() {
    setSelectedIncidentId(null);
    setSelectedIncident(null);
    setDetailsError(null);
    setIsDetailsLoading(false);
  }

  async function handleCreateIncident(values: IncidentFormValues) {
    if (!token || user?.role !== "staff" || isSubmittingIncident) {
      return;
    }

    setIsSubmittingIncident(true);
    setIncidentFormError(null);
    setIncidentSuccess(null);

    try {
      const createdIncident = await createSecurityIncident(token, {
        ...values,
        occurred_at: `${values.occurred_at}:00`,
      });

      setIncidents((previous) => [createdIncident, ...previous]);

      setIncidentSuccess(
        `Incident ${createdIncident.incident_number} was reported successfully.`,
      );

      setIsIncidentFormOpen(false);
    } catch (error: unknown) {
      setIncidentFormError(
        error instanceof Error
          ? error.message
          : "Unable to submit the incident report.",
      );
    } finally {
      setIsSubmittingIncident(false);
    }
  }

  return (
    <AppLayout>
      <div className="coms-dashboard">
        <div className="coms-dashboard-heading">
          <div>
            <h1>Security Incidents</h1>
            <p>Manage and monitor reported campus security incidents.</p>
          </div>

          {canCreateIncident && (
            <button
              type="button"
              className="coms-incidents-create-button"
              onClick={() => setIsIncidentFormOpen(true)}
              aria-expanded={isIncidentFormOpen}
              aria-controls="coms-incident-create-form"
            >
              <Plus size={17} aria-hidden="true" />
              Report Incident
            </button>
          )}
        </div>

        {canCreateIncident && isIncidentFormOpen && (
          <section
            id="coms-incident-create-form"
            className="coms-records-card"
            aria-labelledby="coms-incident-create-title"
          >
            <div className="coms-records-header">
              <div>
                <h2 id="coms-incident-create-title">
                  Report Security Incident
                </h2>
                <p>Provide the details of the incident.</p>
              </div>

              <button
                type="button"
                className="coms-incidents-close-button"
                onClick={() => setIsIncidentFormOpen(false)}
                aria-label="Close incident form"
              >
                <X size={17} aria-hidden="true" />
                Close
              </button>
            </div>

            {incidentFormError && (
              <div className="coms-dashboard-error" role="alert">
                {incidentFormError}
              </div>
            )}

            <IncidentForm
              onSubmit={handleCreateIncident}
              onCancel={() => setIsIncidentFormOpen(false)}
              isSubmitting={isSubmittingIncident}
            />
          </section>
        )}

        {incidentSuccess && <p role="status">{incidentSuccess}</p>}

        <section
          className="coms-records-card"
          aria-labelledby="coms-incidents-list-title"
        >
          <div className="coms-records-header">
            <div>
              <h2 id="coms-incidents-list-title">Incident Records</h2>
              <p>Review reported incidents and their investigation status.</p>
            </div>

            {!isLoading && !error && (
              <span className="coms-incidents-record-count" role="status">
                Showing {filteredIncidents.length} of {incidents.length}{" "}
                incidents
              </span>
            )}
          </div>

          <div className="coms-incidents-toolbar">
            <label htmlFor="incident-search">Search incidents</label>

            <div className="coms-incidents-search">
              <Search size={17} aria-hidden="true" />

              <input
                id="incident-search"
                type="search"
                placeholder="Search reference, title, type, location..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="coms-incidents-filter">
              <label htmlFor="incident-status-filter">Filter by status</label>

              <select
                id="incident-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          {isLoading ? (
            <div className="coms-records-empty" role="status">
              <p>Loading security incidents...</p>
            </div>
          ) : error ? (
            <div className="coms-records-empty" role="alert">
              <p>{error}</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="coms-records-empty">
              <ShieldAlert size={32} strokeWidth={1.5} aria-hidden="true" />

              <p>No security incidents recorded</p>
              <span>Reported security incidents will appear here.</span>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="coms-records-empty" role="status">
              <p>No matching incidents found</p>
              <span>Try adjusting your search or status filter.</span>
            </div>
          ) : (
            <div className="coms-records-table-wrapper">
              <table className="coms-records-table">
                <thead>
                  <tr>
                    <th scope="col">Reference</th>
                    <th scope="col">Incident Type</th>
                    <th scope="col">Title</th>
                    <th scope="col">Location</th>
                    <th scope="col">Status</th>
                    <th scope="col">Date Reported</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIncidents.map((incident) => (
                    <tr key={incident.id}>
                      <td>{incident.incident_number}</td>
                      <td>{incident.incident_type}</td>
                      <td>{incident.title}</td>
                      <td>{incident.location}</td>

                      <td>
                        <span
                          className={`coms-record-status ${getStatusClass(incident.status)}`}
                        >
                          {formatStatus(incident.status)}
                        </span>
                      </td>

                      <td>{formatIncidentDate(incident.reported_at)}</td>

                      <td>
                        <button
                          type="button"
                          className="coms-incidents-view-button"
                          onClick={() => handleViewDetails(incident.id)}
                          aria-label={`View details for ${incident.incident_number}`}
                        >
                          <Eye size={15} aria-hidden="true" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedIncidentId !== null && (
          <section
            className="coms-records-card"
            aria-label="Selected incident details"
          >
            <div className="coms-records-header">
              <div>
                <h2>Incident Report Details</h2>
                <p>Complete information for the selected incident.</p>
              </div>

              <button
                type="button"
                className="coms-incidents-close-button"
                onClick={handleCloseDetails}
                aria-label="Close incident details"
              >
                <X size={17} aria-hidden="true" />
                Close
              </button>
            </div>

            {isDetailsLoading ? (
              <div className="coms-records-empty" role="status">
                <p>Loading incident details...</p>
              </div>
            ) : detailsError ? (
              <div className="coms-records-empty" role="alert">
                <p>{detailsError}</p>
              </div>
            ) : selectedIncident ? (
              <>
                <IncidentDetails incident={selectedIncident} />

                <div className="coms-incident-details">
                  <IncidentAuditHistory
                    logs={auditLogs}
                    isLoading={isAuditLoading}
                    error={auditError}
                  />
                </div>
              </>
            ) : null}
          </section>
        )}

        <div className="coms-dashboard-header-actions">
          <ClipboardList size={16} aria-hidden="true" />
          <span>
            Incident management is available to authorized personnel only.
          </span>
        </div>
      </div>
    </AppLayout>
  );
}
