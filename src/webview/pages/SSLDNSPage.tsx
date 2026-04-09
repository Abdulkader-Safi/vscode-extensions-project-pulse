import React from "react";
import TopBar from "../components/layout/TopBar";
import { useProjects } from "../hooks/useProjects";
import { postMessage } from "../hooks/useExtensionMessage";

const SSLDNSPage: React.FC = () => {
  const { projects, refreshAll } = useProjects();

  const projectsWithSSL = projects.filter((p) => p.lastCheck.ssl);
  const projectsWithDNS = projects.filter((p) => p.lastCheck.dns);

  return (
    <>
      <TopBar
        title="SSL & DNS Monitor"
        actions={
          <button
            onClick={refreshAll}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Refresh
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* SSL Certificates Table */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
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
            SSL Certificates
          </h2>
          {projectsWithSSL.length === 0 ? (
            <p className="text-sm text-slate-500">
              No SSL data yet. Run checks on your projects to see results.
            </p>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                      Project / Domain
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                      Issuer
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                      Expires
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                      Days Left
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projectsWithSSL.map((project) => {
                    const ssl = project.lastCheck.ssl!;
                    const status =
                      ssl.daysRemaining <= 7
                        ? "critical"
                        : ssl.daysRemaining <= 30
                          ? "warning"
                          : "valid";
                    return (
                      <tr
                        key={project.id}
                        className="border-b border-slate-800/50 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">
                            {project.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {project.url}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {ssl.issuer}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {new Date(ssl.validTo).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-medium ${
                              status === "critical"
                                ? "text-red-400"
                                : status === "warning"
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                            }`}
                          >
                            {ssl.daysRemaining}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                              status === "critical"
                                ? "bg-red-500/15 text-red-400"
                                : status === "warning"
                                  ? "bg-amber-500/15 text-amber-400"
                                  : "bg-emerald-500/15 text-emerald-400"
                            }`}
                          >
                            {status === "critical"
                              ? "Expiring"
                              : status === "warning"
                                ? "Warning"
                                : "Valid"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DNS Resolution Table */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
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
            DNS Resolution
          </h2>
          {projectsWithDNS.length === 0 ? (
            <p className="text-sm text-slate-500">
              No DNS data yet. Run checks on your projects to see results.
            </p>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                      Domain
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                      Record Type
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projectsWithDNS.map((project) => {
                    const dns = project.lastCheck.dns!;
                    const records: Array<{
                      type: string;
                      values: string[];
                    }> = [];
                    if (dns.a.length)
                      records.push({ type: "A", values: dns.a });
                    if (dns.cname.length)
                      records.push({ type: "CNAME", values: dns.cname });
                    if (dns.ns.length)
                      records.push({ type: "NS", values: dns.ns });

                    return records.map((rec, i) => (
                      <tr
                        key={`${project.id}-${rec.type}`}
                        className="border-b border-slate-800/50 last:border-0"
                      >
                        {i === 0 ? (
                          <td
                            className="px-4 py-3 text-white font-medium"
                            rowSpan={records.length}
                          >
                            {project.name}
                          </td>
                        ) : null}
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {rec.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                          {rec.values.join(", ")}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SSLDNSPage;
