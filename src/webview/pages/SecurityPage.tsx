import React from "react";
import TopBar from "../components/layout/TopBar";
import SeverityBadge from "../components/shared/SeverityBadge";
import { useProjects } from "../hooks/useProjects";

const SecurityPage: React.FC = () => {
  const { projects } = useProjects();

  const allVulns = projects.flatMap((project) =>
    (project.lastCheck.security || []).map((vuln) => ({
      ...vuln,
      projectName: project.name,
      projectId: project.id,
    })),
  );

  const sortedVulns = allVulns.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, unknown: 4 };
    return (
      (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
    );
  });

  return (
    <>
      <TopBar title="Security Advisories" />
      <div className="flex-1 overflow-y-auto p-6">
        {sortedVulns.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <p>No security vulnerabilities found across your projects.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Project
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Package
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Severity
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Version
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Fix Available
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVulns.map((vuln, i) => (
                  <tr
                    key={`${vuln.projectId}-${vuln.package}-${i}`}
                    className="border-b border-slate-800/50 last:border-0"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {vuln.projectName}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {vuln.package}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={vuln.severity} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {vuln.version}
                    </td>
                    <td className="px-4 py-3">
                      {vuln.fixAvailable ? (
                        <span className="text-emerald-400 text-xs">
                          {vuln.patchedVersion || "Yes"}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default SecurityPage;
