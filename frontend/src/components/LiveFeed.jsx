import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import RiskBadge from "./RiskBadge";
import { formatCurrency } from "../utils/helpers";

export default function LiveFeed() {
  const [events, setEvents] = useState([]);

  const handler = useCallback((msg) => {
    if (msg.event === "transaction") {
      setEvents((prev) => [{ ...msg.data, ts: Date.now() }, ...prev].slice(0, 15));
    }
  }, []);

  useWebSocket(handler);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Live Activity
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          LIVE
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {events.length === 0 && (
          <div className="text-sm text-muted text-center py-8">
            Waiting for transactions...
          </div>
        )}
        {events.map((e, i) => (
          <div
            key={`${e.id}-${i}`}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              e.is_fraud
                ? "bg-red-500/5 border-red-500/20"
                : "bg-surface border-border"
            } animate-[fadeIn_0.3s_ease-out]`}
          >
            <div className="flex items-center gap-3">
              <RiskBadge score={e.risk_score} />
              <div>
                <div className="text-sm font-medium">{e.user_id}</div>
                <div className="text-xs text-muted">{formatCurrency(e.amount)}</div>
              </div>
            </div>
            {e.is_fraud && (
              <span className="text-xs font-semibold text-red-400 uppercase">
                Flagged
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
