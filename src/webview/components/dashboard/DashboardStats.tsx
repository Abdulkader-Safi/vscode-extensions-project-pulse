import React from "react";
import type { Project } from "../../../types/project";

interface DashboardStatsProps {
  projects: Project[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ projects }) => {
  const total = projects.length;
  const healthy = projects.filter((p) => p.status === "healthy").length;
  const warnings = projects.filter((p) => p.status === "warning").length;
  const critical = projects.filter((p) => p.status === "critical").length;

  const stats = [
    {
      label: "Projects",
      value: total,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
        </svg>
      ),
      color: "text-slate-400",
      bg: "bg-slate-500/10",
    },
    {
      label: "Healthy",
      value: healthy,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Warnings",
      value: warnings,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Critical",
      value: critical,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
        >
          <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
            {stat.icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
