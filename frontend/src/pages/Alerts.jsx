import { useEffect, useState, useCallback } from "react";
import Topbar from "../components/Topbar";
import RiskBadge from "../components/RiskBadge";
import SeverityBadge from "../components/SeverityBadge";
import { fetchAlerts, fetchAlertCounts } from "../utils/api";
import { formatDate } from "../utils/helpers";

const SEVERITIES = ["all", "critical", "high", "medium", "low"];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const [a, c] = await Promise.all([
      fetchAlerts(filter === "all" ? {} : { severity: filter }),
      fetchAlertCounts(),
    ]);
    setAlerts(a);
    setCounts(c);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const totalAlerts = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex-1">
      <Topbar title="Fraud Alerts" onDataChange={load} />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="card">
            <div className="text-xs text-muted uppercase tracking-wide font-semibold">
              Total
            </div>
            <div className="text-3xl font-bold mt-2">{totalAlerts}</div>
          </div>
          <div className="card ring-1 ring-red-500/20">
            <div className="text-xs text-red-400 uppercase tracking-wide font-semibold">
              Critical
            </div>
            <div className="text-3xl font-bold text-red-400 mt-2">
              {counts.critical || 0}
            </div>
          </div>
          <div className="card ring-1 ring-orange-500/20">
            <div className="text-xs text-orange-400 uppercase tracking-wide font-semibold">
              High
            </div>
            <div className="text-3xl font-bold text-orange-400 mt-2">
              {counts.high || 0}
            </div>
          </div>
          <div className="card ring-1 ring-yellow-500/20">
            <div className="text-xs text-yellow-400 uppercase tracking-wide font-semibold">
              Medium
            </div>
            <div className="text-3xl font-bold text-yellow-400 mt-2">
              {counts.medium || 0}
            </div>
          </div>
          <div className="card ring-1 ring-green-500/20">
            <div className="text-xs text-green-400 uppercase tracking-wide font-semibold">
              Low
            </div>
            <div className="text-3xl font-bold text-green-400 mt-2">
              {counts.low || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === s
                  ? "bg-accent text-white"
                  : "bg-card text-gray-400 hover:text-gray-200 border border-border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="card text-center text-muted py-10">
              No alerts {filter !== "all" ? `at ${filter} severity` : ""}. Click
              "Generate Data" to simulate transactions.
            </div>
          )}
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="card hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-sm font-mono text-muted">
                    #TX-{alert.transaction_id}
                  </span>
                  <span className="text-sm font-medium">{alert.user_id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge score={alert.risk_score} />
                  <span className="text-xs text-muted">
                    {formatDate(alert.created_at)}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed">
                {alert.reasons.split(";").map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 py-0.5">
                    <span className="text-accent mt-0.5">▹</span>
                    <span>{reason.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
