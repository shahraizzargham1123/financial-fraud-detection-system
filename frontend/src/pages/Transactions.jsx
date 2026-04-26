import { useEffect, useState, useCallback } from "react";
import Topbar from "../components/Topbar";
import RiskBadge from "../components/RiskBadge";
import { fetchTransactions } from "../utils/api";
import { formatCurrency, formatDate } from "../utils/helpers";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    user_id: "",
    min_risk_score: "",
    is_fraud: "",
  });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (filters.user_id) params.user_id = filters.user_id;
    if (filters.min_risk_score) params.min_risk_score = filters.min_risk_score;
    if (filters.is_fraud !== "") params.is_fraud = filters.is_fraud === "true";
    params.limit = 200;

    try {
      const data = await fetchTransactions(params);
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex-1">
      <Topbar title="Transactions" onDataChange={load} />

      <div className="p-8 space-y-6">
        <div className="card">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-muted uppercase tracking-wide mb-1 block">
                User ID
              </label>
              <input
                className="input w-full"
                placeholder="e.g. user_001"
                value={filters.user_id}
                onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-muted uppercase tracking-wide mb-1 block">
                Min Risk Score
              </label>
              <input
                type="number"
                className="input w-full"
                placeholder="0 – 100"
                value={filters.min_risk_score}
                onChange={(e) =>
                  setFilters({ ...filters, min_risk_score: e.target.value })
                }
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-muted uppercase tracking-wide mb-1 block">
                Fraud Status
              </label>
              <select
                className="input w-full"
                value={filters.is_fraud}
                onChange={(e) => setFilters({ ...filters, is_fraud: e.target.value })}
              >
                <option value="">All</option>
                <option value="true">Flagged</option>
                <option value="false">Normal</option>
              </select>
            </div>
            <button
              className="btn-ghost"
              onClick={() =>
                setFilters({ user_id: "", min_risk_score: "", is_fraud: "" })
              }
            >
              Clear
            </button>
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-left text-xs text-muted uppercase tracking-wide">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Merchant</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted">
                      No transactions found. Click "Generate Data" to create some.
                    </td>
                  </tr>
                )}
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t border-border table-row-hover"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      #{tx.id}
                    </td>
                    <td className="px-4 py-3 font-medium">{tx.user_id}</td>
                    <td className="px-4 py-3 font-mono">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{tx.location}</td>
                    <td className="px-4 py-3 text-gray-400">{tx.merchant_type}</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge score={tx.risk_score} />
                    </td>
                    <td className="px-4 py-3">
                      {tx.is_fraud ? (
                        <span className="text-red-400 text-xs font-semibold uppercase">
                          Flagged
                        </span>
                      ) : (
                        <span className="text-green-400 text-xs font-semibold uppercase">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
