import React from "react";
import type { SSLResult } from "../../../types/project";
import Card from "../shared/Card";

interface SSLPanelProps {
  ssl: SSLResult | null;
  onRunCheck: () => void;
  isRunning: boolean;
}

const SSLPanel: React.FC<SSLPanelProps> = ({ ssl, onRunCheck, isRunning }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-indigo-400"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h3 className="text-sm font-semibold text-white">SSL Certificate</h3>
        </div>
        <button
          onClick={onRunCheck}
          disabled={isRunning}
          className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isRunning ? "Checking..." : "Run Check"}
        </button>
      </div>

      {ssl ? (
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Issuer" value={ssl.issuer} />
          <InfoRow label="Valid From" value={formatDate(ssl.validFrom)} />
          <InfoRow label="Valid To" value={formatDate(ssl.validTo)} />
          <InfoRow
            label="Days Remaining"
            value={`${ssl.daysRemaining}`}
            highlight={
              ssl.daysRemaining <= 7
                ? "critical"
                : ssl.daysRemaining <= 30
                  ? "warning"
                  : "ok"
            }
          />
          <InfoRow label="Protocol" value={ssl.protocol} />
          <InfoRow label="Subject" value={ssl.subject} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No SSL data yet. Run a check to get started.
        </p>
      )}
    </Card>
  );
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const InfoRow: React.FC<{
  label: string;
  value: string;
  highlight?: "ok" | "warning" | "critical";
}> = ({ label, value, highlight }) => {
  const valueColor =
    highlight === "critical"
      ? "text-red-400"
      : highlight === "warning"
        ? "text-amber-400"
        : "text-slate-300";

  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-sm font-medium ${valueColor}`}>{value}</div>
    </div>
  );
};

export default SSLPanel;
