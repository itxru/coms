import { useState, type FormEvent } from "react";

export interface IncidentFormValues {
  incident_type: string;
  title: string;
  description: string;
  location: string;
  occurred_at: string;
}

interface IncidentFormProps {
  onSubmit: (values: IncidentFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  initialValues?: IncidentFormValues;
}

export default function IncidentForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
  initialValues,
}: IncidentFormProps) {
  const [values, setValues] = useState<IncidentFormValues>(
    () =>
      initialValues ?? {
        incident_type: "",
        title: "",
        description: "",
        location: "",
        occurred_at: "",
      },
  );

  function updateField(field: keyof IncidentFormValues, value: string) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    void onSubmit(values);
  }

  return (
    <form className="coms-incident-form" onSubmit={handleSubmit}>
      <div className="coms-incident-form-grid">
        <div className="coms-incident-form-field">
          <label htmlFor="incident-type">Incident Type</label>
          <input
            id="incident-type"
            type="text"
            required
            maxLength={100}
            value={values.incident_type}
            onChange={(event) =>
              updateField("incident_type", event.target.value)
            }
            placeholder="e.g. Security Concern"
          />
        </div>

        <div className="coms-incident-form-field">
          <label htmlFor="incident-location">Location</label>
          <input
            id="incident-location"
            type="text"
            required
            maxLength={255}
            value={values.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Where did the incident occur?"
          />
        </div>

        <div className="coms-incident-form-field">
          <label htmlFor="incident-title">Incident Title</label>
          <input
            id="incident-title"
            type="text"
            required
            maxLength={200}
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Brief incident title"
          />
        </div>

        <div className="coms-incident-form-field">
          <label htmlFor="incident-occurred-at">
            Date and Time of Incident
          </label>
          <input
            id="incident-occurred-at"
            type="datetime-local"
            required
            value={values.occurred_at}
            onChange={(event) => updateField("occurred_at", event.target.value)}
          />
        </div>

        <div className="coms-incident-form-field coms-incident-form-full">
          <label htmlFor="incident-description">Description</label>
          <textarea
            id="incident-description"
            required
            rows={5}
            value={values.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe the incident in detail..."
          />
        </div>
      </div>

      <div className="coms-incident-form-actions">
        <button
          type="button"
          className="coms-incidents-close-button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="coms-incidents-create-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === "edit"
              ? "Saving..."
              : "Submitting..."
            : mode === "edit"
              ? "Save Changes"
              : "Submit Incident"}
        </button>
      </div>
    </form>
  );
}
