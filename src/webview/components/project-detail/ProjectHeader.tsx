import React from "react";
import type { Project } from "../../../types/project";
import StatusBadge from "../shared/StatusBadge";

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{project.name}</h2>
        <p className="text-sm text-slate-500">{project.url}</p>
      </div>
      <StatusBadge status={project.status} />
    </div>
  );
};

export default ProjectHeader;
