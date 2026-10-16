import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { ChartNoAxesCombined } from "lucide-react";

export type IncidentTrendData = {
  quarter: string;
  incidents: number;
  resolved: number;
};

type IncidentTrendChartProps = {
  data: IncidentTrendData[];
  title?: string;
};

export default function IncidentTrendChart({
  data,
  title = "Incident Trends",
}: IncidentTrendChartProps) {
  const hasData = data.length > 0;

  return (
    <section className="coms-chart-card" aria-label={title}>
      <div className="coms-chart-header">
        <div>
          <h2>{title}</h2>
          <p>Recorded incidents and resolved cases by quarter</p>
        </div>
      </div>

      {hasData ? (
        <div
          className="coms-chart-container"
          role="img"
          aria-label="Line chart comparing incidents and resolved or closed cases by quarter"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: -15,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E4EAF0"
                vertical={false}
              />

              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 11, fill: "#738797" }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#738797" }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="incidents"
                name="Total Incidents"
                stroke="#2475DB"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="resolved"
                name="Resolved / Closed"
                stroke="#22996D"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="coms-chart-empty">
          <ChartNoAxesCombined size={32} strokeWidth={1.5} aria-hidden="true" />

          <p>No incident trend data available</p>

          <span>
            Incident analytics will appear when records are available.
          </span>
        </div>
      )}
    </section>
  );
}
