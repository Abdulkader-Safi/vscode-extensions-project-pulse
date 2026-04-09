import React from "react";
import type { UptimeResult } from "../../../types/project";
import Card from "../shared/Card";

interface UptimePanelProps {
  uptime: UptimeResult | null;
  onRunCheck: () => void;
  isRunning: boolean;
}

const UptimePanel: React.FC<UptimePanelProps> = ({
  uptime,
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
            className="text-emerald-400"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Uptime</h3>
        </div>
        <button
          onClick={onRunCheck}
          disabled={isRunning}
          className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isRunning ? "Checking..." : "Run Check"}
        </button>
      </div>

      {uptime ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${uptime.up ? "bg-emerald-400" : "bg-red-400"}`}
            />
            <span
              className={`text-lg font-bold ${uptime.up ? "text-emerald-400" : "text-red-400"}`}
            >
              {uptime.up ? "Up" : "Down"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500">Status Code</div>
              <div className="text-sm font-medium text-slate-300">
                {uptime.status || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Response Time</div>
              <div className="text-sm font-medium text-slate-300">
                {uptime.responseTime}ms
              </div>
            </div>
            {uptime.headers.server && (
              <div>
                <div className="text-xs text-slate-500">Server</div>
                <div className="text-sm font-medium text-slate-300">
                  {uptime.headers.server}
                </div>
              </div>
            )}
            {uptime.error && (
              <div className="col-span-2">
                <div className="text-xs text-slate-500">Error</div>
                <div className="text-sm font-medium text-red-400">
                  {uptime.error}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No uptime data yet. Run a check to get started.
        </p>
      )}
    </Card>
  );
};

export default UptimePanel;
