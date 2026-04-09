import React from "react";
import type { MonitoringConfig } from "../../../types/project";
import type { ProjectInfoData } from "./Step1ProjectInfo";

interface Step3Props {
  info: ProjectInfoData;
  monitoring: MonitoringConfig;
}

const Step3Review: React.FC<Step3Props> = ({ info, monitoring }) => {
  const enabledChecks = (
    Object.entries(monitoring) as [string, boolean | number][]
  )
    .filter(([key, val]) => key !== "uptimeInterval" && val === true)
    .map(([key]) => key.toUpperCase());

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Project Details
        </h3>
        <ReviewRow label="Name" value={info.name} />
        <ReviewRow label="URL" value={`https://${info.url}`} />
        <ReviewRow label="Client" value={info.client || "-"} />
        <ReviewRow label="Tech Stack" value={info.techStack || "-"} />
        <ReviewRow label="Description" value={info.description || "-"} />
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Monitoring Configuration
        </h3>
        <ReviewRow
          label="Active Checks"
          value={enabledChecks.join(", ") || "None"}
        />
        <ReviewRow
          label="Check Interval"
          value={`Every ${monitoring.uptimeInterval} minutes`}
        />
      </div>
    </div>
  );
};

const ReviewRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-start">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-sm text-white text-right max-w-[60%]">{value}</span>
  </div>
);

export default Step3Review;
