import React from "react";
import type { Project } from "../../../types/project";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (id: string) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onProjectClick,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-slate-400">Project Health</h2>
        <span className="text-xs text-slate-600">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={onProjectClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectGrid;
