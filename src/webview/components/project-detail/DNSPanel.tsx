import React from "react";
import type { DNSResult } from "../../../types/project";
import Card from "../shared/Card";

interface DNSPanelProps {
  dns: DNSResult | null;
  onRunCheck: () => void;
  isRunning: boolean;
}

const DNSPanel: React.FC<DNSPanelProps> = ({ dns, onRunCheck, isRunning }) => {
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
            className="text-cyan-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">DNS Resolution</h3>
        </div>
        <button
          onClick={onRunCheck}
          disabled={isRunning}
          className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isRunning ? "Checking..." : "Run Check"}
        </button>
      </div>

      {dns ? (
        <div className="space-y-2">
          {dns.a.length > 0 && <RecordRow type="A" values={dns.a} />}
          {dns.aaaa.length > 0 && <RecordRow type="AAAA" values={dns.aaaa} />}
          {dns.cname.length > 0 && (
            <RecordRow type="CNAME" values={dns.cname} />
          )}
          {dns.mx.length > 0 && (
            <RecordRow
              type="MX"
              values={dns.mx.map(
                (mx) => `${mx.exchange} (priority: ${mx.priority})`,
              )}
            />
          )}
          {dns.ns.length > 0 && <RecordRow type="NS" values={dns.ns} />}
          {dns.txt.length > 0 && (
            <RecordRow type="TXT" values={dns.txt.map((t) => t.join(""))} />
          )}
          {dns.a.length === 0 &&
            dns.aaaa.length === 0 &&
            dns.cname.length === 0 && (
              <p className="text-sm text-slate-500">No DNS records found.</p>
            )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No DNS data yet. Run a check to get started.
        </p>
      )}
    </Card>
  );
};

const RecordRow: React.FC<{ type: string; values: string[] }> = ({
  type,
  values,
}) => (
  <div className="flex items-start gap-3 py-1.5 border-b border-slate-800 last:border-0">
    <span className="text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded min-w-[50px] text-center">
      {type}
    </span>
    <div className="flex-1">
      {values.map((v, i) => (
        <div key={i} className="text-sm text-slate-300 font-mono">
          {v}
        </div>
      ))}
    </div>
  </div>
);

export default DNSPanel;
