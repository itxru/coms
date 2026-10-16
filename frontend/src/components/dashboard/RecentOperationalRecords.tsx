import { ClipboardList } from "lucide-react";

export type OperationalRecord = {
  id: string;
  reference: string;
  category: string;
  description: string;
  status: string;
  recordedAt: string;
};

type RecentOperationalRecordsProps = {
  records: OperationalRecord[];
};

function formatRecordedDate(value: string): string {
  if (!value) return "—";

  // Backend timestamps without timezone information are
  // displayed as recorded, without applying a timezone shift.
  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) return value;

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  if (!year || !month || !day || !hour || !minute) {
    return value;
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

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

function getStatusClass(status: string): string {
  switch (
    status
      .toLowerCase()
      .replace(/[_\s]+/g, " ")
      .trim()
  ) {
    case "open":
      return "coms-record-status-open";

    case "under investigation":
      return "coms-record-status-investigation";

    case "resolved":
      return "coms-record-status-resolved";

    case "closed":
      return "coms-record-status-closed";

    default:
      return "coms-record-status-default";
  }
}

export default function RecentOperationalRecords({
  records,
}: RecentOperationalRecordsProps) {
  return (
    <section className="coms-records-card" aria-labelledby="coms-records-title">
      <div className="coms-records-header">
        <div>
          <h2 id="coms-records-title">Recent Operational Records</h2>
          <p>Latest recorded campus security activities</p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="coms-records-empty">
          <ClipboardList size={32} strokeWidth={1.5} aria-hidden="true" />

          <p>No operational records available</p>

          <span>
            Recent security activities will appear when records are available.
          </span>
        </div>
      ) : (
        <div className="coms-records-table-wrapper">
          <table className="coms-records-table">
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Category</th>
                <th scope="col">Description</th>
                <th scope="col">Status</th>
                <th scope="col">Date Recorded</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.reference}</td>
                  <td>{record.category}</td>
                  <td>{record.description}</td>

                  <td>
                    <span
                      className={`coms-record-status ${getStatusClass(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td>{formatRecordedDate(record.recordedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
