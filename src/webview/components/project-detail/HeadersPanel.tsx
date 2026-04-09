import React from "react";
import type { SecurityHeadersResult } from "../../../types/project";
import Card from "../shared/Card";

interface HeadersPanelProps {
  headers: SecurityHeadersResult | null;
  onRunCheck: () => void;
  isRunning: boolean;
}

const HeadersPanel: React.FC<HeadersPanelProps> = ({
  headers,
  onRunCheck,
  isRunning,
}) => {
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
            className="text-amber-400"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Security Headers</h3>
        </div>
        <button
          onClick={onRunCheck}
          disabled={isRunning}
          className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isRunning ? "Checking..." : "Run Check"}
        </button>
      </div>

      {headers ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-500">Score:</span>
            <span
              className={`text-sm font-bold ${
                headers.score >= 80
                  ? "text-emerald-400"
                  : headers.score >= 50
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {headers.score}%
            </span>
          </div>
          {headers.checks.map((check) => (
            <div
              key={check.name}
              className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${check.present ? "bg-emerald-400" : "bg-red-400"}`}
                />
                <span className="text-sm text-slate-300">{check.name}</span>
              </div>
              <span
                className={`text-xs ${check.present ? "text-emerald-400" : "text-red-400"}`}
              >
                {check.present ? "Present" : "Missing"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No security headers data yet. Run a check to get started.
        </p>
      )}
    </Card>
  );
};

export default HeadersPanel;
