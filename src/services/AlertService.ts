import * as vscode from "vscode";
import type { Project, Alert } from "../types/project";
import { generateId } from "../utils/uuid";

export class AlertService {
  private _context: vscode.ExtensionContext;
  private static ALERTS_KEY = "projectPulse.alerts";

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  getAlerts(): Alert[] {
    return this._context.globalState.get<Alert[]>(
      AlertService.ALERTS_KEY,
      [],
    );
  }

  async dismissAlert(alertId: string) {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) =>
      a.id === alertId ? { ...a, dismissed: true } : a,
    );
    await this._context.globalState.update(AlertService.ALERTS_KEY, updated);
  }

  async evaluate(project: Project): Promise<Alert[]> {
    const newAlerts: Alert[] = [];
    const { lastCheck } = project;

    // SSL alerts
    if (lastCheck.ssl) {
      if (lastCheck.ssl.daysRemaining <= 7) {
        newAlerts.push(
          this._createAlert(
            project,
            "ssl",
            "critical",
            `SSL certificate expires in ${lastCheck.ssl.daysRemaining} days. Renew immediately to avoid downtime.`,
          ),
        );
      } else if (lastCheck.ssl.daysRemaining <= 30) {
        newAlerts.push(
          this._createAlert(
            project,
            "ssl",
            "warning",
            `SSL certificate expires in ${lastCheck.ssl.daysRemaining} days.`,
          ),
        );
      }
    }

    // Uptime alerts
    if (lastCheck.uptime && !lastCheck.uptime.up) {
      newAlerts.push(
        this._createAlert(
          project,
          "uptime",
          "critical",
          `Site is down. Status: ${lastCheck.uptime.status || "unreachable"}. ${lastCheck.uptime.error || ""}`,
        ),
      );
    }

    // Security alerts
    if (lastCheck.security) {
      const critical = lastCheck.security.filter(
        (v) => v.severity === "critical",
      );
      const high = lastCheck.security.filter((v) => v.severity === "high");
      if (critical.length > 0) {
        newAlerts.push(
          this._createAlert(
            project,
            "security",
            "critical",
            `${critical.length} critical vulnerability${critical.length > 1 ? "ies" : "y"} found.`,
          ),
        );
      } else if (high.length > 0) {
        newAlerts.push(
          this._createAlert(
            project,
            "security",
            "warning",
            `${high.length} high severity vulnerability${high.length > 1 ? "ies" : "y"} found.`,
          ),
        );
      }
    }

    // Headers alerts
    if (lastCheck.headers) {
      if (
        !lastCheck.headers.checks.find(
          (c) =>
            c.name === "Strict-Transport-Security" ||
            c.name === "Content-Security-Policy",
        )?.present
      ) {
        newAlerts.push(
          this._createAlert(
            project,
            "headers",
            "critical",
            "Missing HSTS or CSP security headers.",
          ),
        );
      } else if (lastCheck.headers.score < 70) {
        newAlerts.push(
          this._createAlert(
            project,
            "headers",
            "warning",
            `Security headers score is ${lastCheck.headers.score}%.`,
          ),
        );
      }
    }

    // Persist new alerts
    if (newAlerts.length > 0) {
      const existing = this.getAlerts();
      const all = [...newAlerts, ...existing].slice(0, 100); // Keep last 100
      await this._context.globalState.update(AlertService.ALERTS_KEY, all);

      // Show VS Code notifications for critical alerts
      for (const alert of newAlerts) {
        if (alert.severity === "critical") {
          vscode.window.showErrorMessage(
            `[Project Pulse] ${alert.projectName}: ${alert.message}`,
          );
        }
      }
    }

    return newAlerts;
  }

  private _createAlert(
    project: Project,
    type: Alert["type"],
    severity: Alert["severity"],
    message: string,
  ): Alert {
    return {
      id: generateId(),
      projectId: project.id,
      projectName: project.name,
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
      dismissed: false,
    };
  }
}
