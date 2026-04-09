import type { Project, Settings, Alert, MonitoringConfig } from "./project";

export type CheckType =
  | "ssl"
  | "dns"
  | "uptime"
  | "security"
  | "lighthouse"
  | "headers";

// Webview -> Extension
export type WebviewMessage =
  | { type: "getProjects" }
  | { type: "getProject"; projectId: string }
  | { type: "addProject"; project: NewProjectData }
  | { type: "updateProject"; projectId: string; updates: Partial<Project> }
  | { type: "deleteProject"; projectId: string }
  | { type: "runCheck"; projectId: string; check: CheckType }
  | { type: "runAllChecks"; projectId: string }
  | { type: "refreshAll" }
  | { type: "getSettings" }
  | { type: "updateSettings"; settings: Partial<Settings> }
  | { type: "getAlerts" }
  | { type: "dismissAlert"; alertId: string };

export interface NewProjectData {
  name: string;
  url: string;
  client: string;
  techStack: string[];
  description: string;
  monitoring: MonitoringConfig;
}

// Extension -> Webview
export type ExtensionMessage =
  | { type: "projects"; data: Project[] }
  | { type: "project"; data: Project }
  | { type: "projectAdded"; data: Project }
  | { type: "projectUpdated"; data: Project }
  | { type: "projectDeleted"; projectId: string }
  | { type: "checkStarted"; projectId: string; check: CheckType }
  | { type: "checkResult"; projectId: string; check: CheckType; data: any }
  | { type: "checkError"; projectId: string; check: CheckType; error: string }
  | { type: "settings"; data: Settings }
  | { type: "alerts"; data: Alert[] }
  | { type: "alert"; data: Alert };
