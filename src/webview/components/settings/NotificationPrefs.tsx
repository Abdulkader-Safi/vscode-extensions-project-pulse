import React from "react";

interface NotificationPrefsProps {
  checks: {
    ssl: boolean;
    dns: boolean;
    uptime: boolean;
    security: boolean;
    lighthouse: boolean;
    headers: boolean;
  };
}

const labels: Record<string, string> = {
  ssl: "SSL Expiry Alerts",
  dns: "DNS Change Alerts",
  uptime: "Uptime Incidents",
  security: "Security Advisories",
  lighthouse: "Lighthouse Score Drops",
  headers: "Security Headers",
};

const NotificationPrefs: React.FC<NotificationPrefsProps> = ({ checks }) => {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white mb-3">
        Notification Preferences
      </h2>
      <div className="space-y-2">
        {Object.entries(checks).map(([key, enabled]) => (
          <div
            key={key}
            className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
          >
            <span className="text-sm text-slate-300">
              {labels[key] || key}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                enabled
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-slate-700 text-slate-500"
              }`}
            >
              {enabled ? "On" : "Off"}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-3">
        Toggle checks in VS Code settings (projectPulse.checks.*).
      </p>
    </div>
  );
};

export default NotificationPrefs;
