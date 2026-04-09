import React from "react";

interface SeverityBadgeProps {
  severity: string;
}

const severityStyles: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-500/15", text: "text-red-400" },
  high: { bg: "bg-orange-500/15", text: "text-orange-400" },
  medium: { bg: "bg-amber-500/15", text: "text-amber-400" },
  low: { bg: "bg-blue-500/15", text: "text-blue-400" },
  unknown: { bg: "bg-slate-500/15", text: "text-slate-400" },
};

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const style = severityStyles[severity] || severityStyles.unknown;
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${style.bg} ${style.text}`}
    >
      {severity}
    </span>
  );
};

export default SeverityBadge;
