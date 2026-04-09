import React from "react";
import type { Project } from "../../../types/project";
import StatusBadge from "../shared/StatusBadge";
import Card from "../shared/Card";
import { extractDomain } from "../../../utils/url";

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const domain = extractDomain(project.url);
  const sslDays = project.lastCheck.ssl?.daysRemaining ?? null;
  const uptimeUp = project.lastCheck.uptime?.up ?? null;
  const vulnCount = project.lastCheck.security?.length ?? null;
  const lighthouseScore =
    project.lastCheck.lighthouse?.scores.performance ?? null;

  return (
    <Card onClick={() => onClick(project.id)} className="relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{project.name}</h3>
          <p className="text-xs text-slate-500">{domain}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <MetricRow
          label="SSL Expires"
          value={sslDays !== null ? `${sslDays} days` : "-"}
        />
        <MetricRow
          label="Uptime"
          value={uptimeUp !== null ? (uptimeUp ? "Up" : "Down") : "-"}
        />
        <MetricRow
          label="Vulnerabilities"
          value={vulnCount !== null ? `${vulnCount}` : "-"}
        />
        <MetricRow
          label="Lighthouse"
          value={lighthouseScore !== null ? `${lighthouseScore}` : "-"}
        />
      </div>
    </Card>
  );
};

const MetricRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-sm font-medium text-slate-300">{value}</div>
  </div>
);

export default ProjectCard;
