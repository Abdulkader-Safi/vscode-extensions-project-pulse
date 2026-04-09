import React from "react";
import type { Alert } from "../../../types/project";

interface AlertsListProps {
  alerts: Alert[];
  onDismiss: (alertId: string) => void;
}

const severityStyles: Record<string, { dot: string; text: string }> = {
  critical: { dot: "bg-red-400", text: "text-red-400" },
  warning: { dot: "bg-amber-400", text: "text-amber-400" },
};

const AlertsList: React.FC<AlertsListProps> = ({ alerts, onDismiss }) => {
  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Recent Alerts</h2>
        {activeAlerts.length > 0 && (
          <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded">
            {activeAlerts.length} active
          </span>
        )}
      </div>
      {activeAlerts.length === 0 ? (
        <p className="text-sm text-slate-500">No active alerts.</p>
      ) : (
        <div className="space-y-2">
          {activeAlerts.slice(0, 10).map((alert) => {
            const style = severityStyles[alert.severity] || severityStyles.warning;
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {alert.projectName}
                    </span>
                    <span
                      className={`text-xs capitalize ${style.text}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {alert.message}
                  </p>
                  <span className="text-xs text-slate-600">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-xs text-slate-500 hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsList;
