import React, { useState, useEffect, useCallback } from "react";
import TopBar from "../components/layout/TopBar";
import AlertsList from "../components/settings/AlertsList";
import ThresholdConfig from "../components/settings/ThresholdConfig";
import NotificationPrefs from "../components/settings/NotificationPrefs";
import MonitoredProjectsList from "../components/settings/MonitoredProjectsList";
import type { Alert, Settings, DEFAULT_SETTINGS } from "../../types/project";
import type { Project } from "../../types/project";
import type { ExtensionMessage } from "../../types/messages";
import { postMessage } from "../hooks/useExtensionMessage";

const SettingsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case "alerts":
          setAlerts(msg.data);
          break;
        case "projects":
          setProjects(msg.data);
          break;
        case "settings":
          setSettings(msg.data as Settings);
          break;
        case "projectDeleted":
          setProjects((prev) => prev.filter((p) => p.id !== msg.projectId));
          break;
      }
    };

    window.addEventListener("message", handler);
    postMessage({ type: "getAlerts" });
    postMessage({ type: "getProjects" });
    postMessage({ type: "getSettings" });

    return () => window.removeEventListener("message", handler);
  }, []);

  const handleDismissAlert = useCallback((alertId: string) => {
    postMessage({ type: "dismissAlert", alertId });
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    postMessage({ type: "deleteProject", projectId });
  }, []);

  return (
    <>
      <TopBar title="Settings & Alerts" subtitle="Configure monitoring thresholds and notification preferences" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Alerts */}
          <div className="space-y-6">
            <AlertsList alerts={alerts} onDismiss={handleDismissAlert} />
          </div>

          {/* Right column: Config */}
          <div className="space-y-6">
            <ThresholdConfig
              sslWarningDays={settings?.sslWarningDays ?? 30}
              sslCriticalDays={settings?.sslCriticalDays ?? 7}
              uptimeWarningThreshold={settings?.uptimeWarningThreshold ?? 99.5}
              lighthouseAlertThreshold={
                settings?.lighthouseAlertThreshold ?? 80
              }
              checkInterval={settings?.checkInterval ?? 15}
            />
            <NotificationPrefs
              checks={
                settings?.checks ?? {
                  ssl: true,
                  dns: true,
                  uptime: true,
                  security: true,
                  lighthouse: false,
                  headers: true,
                }
              }
            />
          </div>
        </div>

        {/* Full width: Monitored Projects */}
        <div className="mt-6">
          <MonitoredProjectsList
            projects={projects}
            onDelete={handleDeleteProject}
          />
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
