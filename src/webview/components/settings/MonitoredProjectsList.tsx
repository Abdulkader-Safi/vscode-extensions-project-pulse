import React from "react";
import type { Project } from "../../../types/project";
import StatusBadge from "../shared/StatusBadge";

interface MonitoredProjectsListProps {
  projects: Project[];
  onDelete: (id: string) => void;
}

const MonitoredProjectsList: React.FC<MonitoredProjectsListProps> = ({
  projects,
  onDelete,
}) => {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white mb-3">
        Monitored Projects
      </h2>
      {projects.length === 0 ? (
        <p className="text-sm text-slate-500">No projects configured.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={project.status} />
                <span className="text-sm text-white">{project.name}</span>
              </div>
              <button
                onClick={() => onDelete(project.id)}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonitoredProjectsList;
