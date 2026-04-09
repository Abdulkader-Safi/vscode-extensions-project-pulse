import React from "react";
import TopBar from "../components/layout/TopBar";
import { useProjects } from "../hooks/useProjects";

const UptimePerformancePage: React.FC = () => {
  const { projects, refreshAll } = useProjects();

  const projectsWithUptime = projects.filter((p) => p.lastCheck.uptime);

  return (
    <>
      <TopBar
        title="Uptime & Performance"
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
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">
            Uptime Overview
          </h2>
          {projectsWithUptime.length === 0 ? (
            <p className="text-sm text-slate-500">
              No uptime data yet. Run checks on your projects.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectsWithUptime.map((project) => {
                const uptime = project.lastCheck.uptime!;
                return (
                  <div
                    key={project.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-white">
                        {project.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          uptime.up
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {uptime.up ? "Up" : "Down"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">
                          Response Time
                        </div>
                        <div className="text-lg font-bold text-white">
                          {uptime.responseTime}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="text-lg font-bold text-white">
                          {uptime.status || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white mb-3">
            Lighthouse Scores Comparison
          </h2>
          <p className="text-sm text-slate-500">
            Lighthouse data will appear here once scans are configured.
          </p>
        </div>
      </div>
    </>
  );
};

export default UptimePerformancePage;
