import { riskColor, riskBg } from "../utils/helpers";

export default function RiskBadge({ score }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md font-mono font-semibold text-xs border ${riskBg(
        score
      )} ${riskColor(score)}`}
    >
      {score.toFixed(0)}
    </span>
  );
}
