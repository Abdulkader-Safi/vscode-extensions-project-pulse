import React from "react";

interface ThresholdConfigProps {
  sslWarningDays: number;
  sslCriticalDays: number;
  uptimeWarningThreshold: number;
  lighthouseAlertThreshold: number;
  checkInterval: number;
}

const ThresholdConfig: React.FC<ThresholdConfigProps> = ({
  sslWarningDays,
  sslCriticalDays,
  uptimeWarningThreshold,
  lighthouseAlertThreshold,
  checkInterval,
}) => {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white mb-3">
        Monitoring Thresholds
      </h2>
      <div className="space-y-3">
        <ThresholdRow label="SSL Expiry Warning" value={`${sslWarningDays} days`} />
        <ThresholdRow label="SSL Expiry Critical" value={`${sslCriticalDays} days`} />
        <ThresholdRow
          label="Uptime Alert Threshold"
          value={`${uptimeWarningThreshold}%`}
        />
        <ThresholdRow
          label="Lighthouse Score Alert"
          value={`< ${lighthouseAlertThreshold}`}
        />
        <ThresholdRow
          label="Check Interval"
          value={`${checkInterval} min`}
        />
      </div>
      <p className="text-xs text-slate-600 mt-3">
        Thresholds are configured in VS Code settings (projectPulse.*).
      </p>
    </div>
  );
};

const ThresholdRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
    <span className="text-sm text-slate-300">{label}</span>
    <span className="text-sm font-medium text-white bg-slate-800 px-3 py-1 rounded">
      {value}
    </span>
  </div>
);

export default ThresholdConfig;
