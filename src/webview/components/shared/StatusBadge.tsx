import React from "react";
import type { ProjectStatus } from "../../../types/project";

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusStyles: Record<
  ProjectStatus,
  { bg: string; text: string; label: string }
> = {
  healthy: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    label: "Healthy",
  },
  warning: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Warning" },
  critical: { bg: "bg-red-500/15", text: "text-red-400", label: "Critical" },
  unknown: { bg: "bg-slate-500/15", text: "text-slate-400", label: "Unknown" },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  );
};

export default StatusBadge;
