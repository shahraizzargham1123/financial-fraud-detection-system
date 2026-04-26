import { severityBadge } from "../utils/helpers";

export default function SeverityBadge({ severity }) {
  return (
    <span className={severityBadge(severity)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {severity.toUpperCase()}
    </span>
  );
}
