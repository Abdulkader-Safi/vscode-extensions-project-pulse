import React from "react";
import type { AuditResult } from "../../../types/project";
import Card from "../shared/Card";
import SeverityBadge from "../shared/SeverityBadge";

interface SecurityPanelProps {
  security: AuditResult[] | null;
  onRunCheck: () => void;
  isRunning: boolean;
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({
  security,
  onRunCheck,
  isRunning,
}) => {
  return (
    <Card className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-orange-400"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">
            Dependency Security
          </h3>
          {security && security.length > 0 && (
            <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded">
              {security.length} vulnerabilit
              {security.length === 1 ? "y" : "ies"}
            </span>
          )}
        </div>
        <button
          onClick={onRunCheck}
          disabled={isRunning}
          className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isRunning ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {security ? (
        security.length === 0 ? (
          <p className="text-sm text-emerald-400">
            No known vulnerabilities found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-500 pb-2">
                    Package
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-2">
                    Severity
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-2">
                    Current
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-2">
                    Patched
                  </th>
                </tr>
              </thead>
              <tbody>
                {security.map((vuln, i) => (
                  <tr
                    key={`${vuln.package}-${i}`}
                    className="border-b border-slate-800/50 last:border-0"
                  >
                    <td className="py-2 text-slate-300 font-mono text-xs">
                      {vuln.package}
                    </td>
                    <td className="py-2">
                      <SeverityBadge severity={vuln.severity} />
                    </td>
                    <td className="py-2 text-slate-400 font-mono text-xs">
                      {vuln.version}
                    </td>
                    <td className="py-2 text-emerald-400 font-mono text-xs">
                      {vuln.patchedVersion || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <p className="text-sm text-slate-500">
          No security data yet. Run a scan to check for vulnerabilities.
        </p>
      )}
    </Card>
  );
};

export default SecurityPanel;
