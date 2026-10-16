const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export type IncidentStatus =
  | "open"
  | "under_investigation"
  | "resolved"
  | "closed";

export interface SecurityIncident {
  id: number;
  incident_number: string;
  incident_type: string;
  title: string;
  description: string;
  location: string;
  occurred_at: string;
  reported_at: string;
  status: IncidentStatus;
  resolution_notes: string | null;
  reported_by_id: number;
  created_at: string;
  updated_at: string;
}

export async function getSecurityIncidents(
  token: string,
  signal?: AbortSignal,
): Promise<SecurityIncident[]> {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load security incidents (HTTP ${response.status})`,
    );
  }

  return (await response.json()) as SecurityIncident[];
}

export async function getSecurityIncidentById(
  token: string,
  incidentId: number,
  signal?: AbortSignal,
): Promise<SecurityIncident> {
  const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load incident details (HTTP ${response.status})`,
    );
  }

  return (await response.json()) as SecurityIncident;
}

export interface IncidentAuditLog {
  id: number;
  incident_id: number;
  performed_by_id: number;
  action: string;
  changes: Record<string, unknown>;
  created_at: string;
}

export async function getIncidentAuditHistory(
  token: string,
  incidentId: number,
  signal?: AbortSignal,
): Promise<IncidentAuditLog[]> {
  const response = await fetch(
    `${API_BASE_URL}/incidents/${incidentId}/audit-history`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load incident audit history (HTTP ${response.status})`,
    );
  }

  return (await response.json()) as IncidentAuditLog[];
}

export interface CreateSecurityIncidentPayload {
  incident_type: string;
  title: string;
  description: string;
  location: string;
  occurred_at: string;
}

export async function createSecurityIncident(
  token: string,
  payload: CreateSecurityIncidentPayload,
): Promise<SecurityIncident> {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "You do not have permission to report security incidents.",
      );
    }

    if (response.status === 422) {
      throw new Error("Invalid incident information. Please review the form.");
    }

    throw new Error(
      `Unable to submit incident report (HTTP ${response.status}).`,
    );
  }

  return (await response.json()) as SecurityIncident;
}

export type UpdateSecurityIncidentPayload =
  Partial<CreateSecurityIncidentPayload> & {
    status?: string;
    resolution_notes?: string | null;
  };

export async function updateSecurityIncident(
  token: string,
  incidentId: number,
  payload: UpdateSecurityIncidentPayload,
): Promise<SecurityIncident> {
  const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("You do not have permission to update this incident.");
    }

    if (response.status === 404) {
      throw new Error("The selected incident could not be found.");
    }

    if (response.status === 422) {
      throw new Error(
        "Invalid incident information. Please review your changes.",
      );
    }

    throw new Error(
      `Unable to update incident report (HTTP ${response.status}).`,
    );
  }

  return (await response.json()) as SecurityIncident;
}
