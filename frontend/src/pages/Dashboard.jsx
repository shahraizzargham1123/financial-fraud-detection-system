import { useEffect, useState, useCallback } from "react";
import Topbar from "../components/Topbar";
import SummaryCard from "../components/SummaryCard";
import FraudDonut from "../components/FraudDonut";
import RiskDistribution from "../components/RiskDistribution";
import MerchantBreakdown from "../components/MerchantBreakdown";
import LiveFeed from "../components/LiveFeed";
import {
  fetchSummary,
  fetchRiskDistribution,
  fetchMerchantBreakdown,
} from "../utils/api";
import { formatCurrency } from "../utils/helpers";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [risk, setRisk] = useState([]);
  const [merchants, setMerchants] = useState([]);

  const loadAll = useCallback(async () => {
    const [s, r, m] = await Promise.all([
      fetchSummary(),
      fetchRiskDistribution(),
      fetchMerchantBreakdown(),
    ]);
    setSummary(s);
    setRisk(r);
    setMerchants(m);
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, [loadAll]);

  return (
    <div className="flex-1">
      <Topbar title="Dashboard" onDataChange={loadAll} />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Transactions"
            value={summary?.total_transactions ?? "-"}
            sublabel={summary ? `${summary.normal_count} normal` : ""}
            accent="accent"
          />
          <SummaryCard
            label="Fraud Detected"
            value={summary?.fraud_count ?? "-"}
            sublabel={summary ? `${summary.fraud_rate}% of total` : ""}
            accent="danger"
          />
          <SummaryCard
            label="Avg Risk Score"
            value={summary ? summary.avg_risk_score.toFixed(1) : "-"}
            sublabel="0 – 100 scale"
            accent="warning"
          />
          <SummaryCard
            label="Total Volume"
            value={summary ? formatCurrency(summary.total_volume) : "-"}
            sublabel="all transactions"
            accent="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FraudDonut
            fraud={summary?.fraud_count ?? 0}
            normal={summary?.normal_count ?? 0}
          />
          <div className="lg:col-span-2">
            <RiskDistribution data={risk} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MerchantBreakdown data={merchants} />
          </div>
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
