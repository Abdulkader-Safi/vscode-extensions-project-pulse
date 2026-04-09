import * as vscode from "vscode";
import { ProjectService } from "./services/ProjectService";
import { StorageService } from "./services/StorageService";
import { SSLService } from "./services/SSLService";
import { DNSService } from "./services/DNSService";
import { UptimeService } from "./services/UptimeService";
import { HeadersService } from "./services/HeadersService";
import { AlertService } from "./services/AlertService";
import { SecurityAuditService } from "./services/SecurityAuditService";
import { LighthouseService } from "./services/LighthouseService";
import { extractDomain } from "./utils/url";
import { computeProjectStatus } from "./utils/status";
import type { CheckType } from "./types/messages";

export class ProjectPulsePanel {
  public static currentPanel: ProjectPulsePanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private readonly _projectService: ProjectService;
  private readonly _storageService: StorageService;
  private readonly _sslService: SSLService;
  private readonly _dnsService: DNSService;
  private readonly _uptimeService: UptimeService;
  private readonly _headersService: HeadersService;
  private readonly _alertService: AlertService;
  private readonly _securityService: SecurityAuditService;
  private readonly _lighthouseService: LighthouseService;
  private _disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
  ) {
    this._panel = panel;
    this._context = context;
    this._projectService = new ProjectService(context);
    this._storageService = new StorageService();
    this._sslService = new SSLService();
    this._dnsService = new DNSService();
    this._uptimeService = new UptimeService();
    this._headersService = new HeadersService();
    this._alertService = new AlertService(context);
    this._securityService = new SecurityAuditService();
    this._lighthouseService = new LighthouseService();

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (data) => {
        await this._handleMessage(data);
      },
      null,
      this._disposables,
    );
  }

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ProjectPulsePanel.currentPanel) {
      ProjectPulsePanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "projectPulseView",
      "Project Pulse",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
        retainContextWhenHidden: true,
      },
    );

    ProjectPulsePanel.currentPanel = new ProjectPulsePanel(panel, context);
  }

  public postMessage(message: any) {
    this._panel.webview.postMessage(message);
  }

  public dispose() {
    ProjectPulsePanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private async _handleMessage(data: any) {
    switch (data.type) {
      case "getProjects": {
        const projects = this._projectService.getAll();
        this.postMessage({ type: "projects", data: projects });
        break;
      }
      case "getProject": {
        const project = this._projectService.getById(data.projectId);
        if (project) {
          this.postMessage({ type: "project", data: project });
        }
        break;
      }
      case "addProject": {
        const newProject = await this._projectService.add(data.project);
        this.postMessage({ type: "projectAdded", data: newProject });
        break;
      }
      case "updateProject": {
        const updated = await this._projectService.update(
          data.projectId,
          data.updates,
        );
        if (updated) {
          this.postMessage({ type: "projectUpdated", data: updated });
        }
        break;
      }
      case "deleteProject": {
        const deleted = await this._projectService.delete(data.projectId);
        if (deleted) {
          this._storageService.deleteHistory(data.projectId);
          this.postMessage({
            type: "projectDeleted",
            projectId: data.projectId,
          });
        }
        break;
      }
      case "runCheck": {
        await this._runSingleCheck(data.projectId, data.check);
        break;
      }
      case "runAllChecks": {
        const proj = this._projectService.getById(data.projectId);
        if (proj) {
          const checks: CheckType[] = [];
          if (proj.monitoring.ssl) checks.push("ssl");
          if (proj.monitoring.dns) checks.push("dns");
          if (proj.monitoring.uptime) checks.push("uptime");
          if (proj.monitoring.security) checks.push("security");
          if (proj.monitoring.lighthouse) checks.push("lighthouse");
          if (proj.monitoring.headers) checks.push("headers");
          for (const check of checks) {
            await this._runSingleCheck(data.projectId, check);
          }
        }
        break;
      }
      case "refreshAll": {
        const allProjects = this._projectService.getAll();
        for (const proj of allProjects) {
          const checks: CheckType[] = [];
          if (proj.monitoring.ssl) checks.push("ssl");
          if (proj.monitoring.dns) checks.push("dns");
          if (proj.monitoring.uptime) checks.push("uptime");
          if (proj.monitoring.headers) checks.push("headers");
          for (const check of checks) {
            await this._runSingleCheck(proj.id, check);
          }
        }
        const refreshed = this._projectService.getAll();
        this.postMessage({ type: "projects", data: refreshed });
        break;
      }
      case "getSettings": {
        const config = vscode.workspace.getConfiguration("projectPulse");
        const settings = {
          lighthouseApiKey: config.get<string>("lighthouseApiKey", ""),
          checkInterval: config.get<number>("checkInterval", 15),
          sslWarningDays: config.get<number>("sslWarningDays", 30),
          sslCriticalDays: config.get<number>("sslCriticalDays", 7),
          uptimeWarningThreshold: config.get<number>("uptimeWarningThreshold", 99.5),
          lighthouseAlertThreshold: config.get<number>("lighthouseAlertThreshold", 80),
          checks: {
            ssl: config.get<boolean>("checks.ssl", true),
            dns: config.get<boolean>("checks.dns", true),
            uptime: config.get<boolean>("checks.uptime", true),
            security: config.get<boolean>("checks.security", true),
            lighthouse: config.get<boolean>("checks.lighthouse", false),
            headers: config.get<boolean>("checks.headers", true),
          },
          dataDirectory: config.get<string>("dataDirectory", "~/.project-pulse"),
        };
        this.postMessage({ type: "settings", data: settings });
        break;
      }
      case "getAlerts": {
        const alerts = this._alertService.getAlerts();
        this.postMessage({ type: "alerts", data: alerts });
        break;
      }
      case "dismissAlert": {
        await this._alertService.dismissAlert(data.alertId);
        const updatedAlerts = this._alertService.getAlerts();
        this.postMessage({ type: "alerts", data: updatedAlerts });
        break;
      }
    }
  }

  private async _runSingleCheck(projectId: string, check: CheckType) {
    const project = this._projectService.getById(projectId);
    if (!project) return;

    this.postMessage({ type: "checkStarted", projectId, check });

    try {
      const domain = extractDomain(project.url);
      let result: any;

      switch (check) {
        case "ssl":
          result = await this._sslService.checkSSL(domain);
          break;
        case "dns":
          result = await this._dnsService.checkDNS(domain);
          break;
        case "uptime":
          result = await this._uptimeService.checkUptime(project.url);
          break;
        case "headers":
          result = await this._headersService.checkHeaders(project.url);
          break;
        case "security": {
          // Try local npm audit first if workspace is open
          const workspaceFolders = vscode.workspace.workspaceFolders;
          if (workspaceFolders && workspaceFolders.length > 0) {
            try {
              result = await this._securityService.runNpmAudit(
                workspaceFolders[0].uri.fsPath,
              );
            } catch {
              result = []; // Fallback to empty if npm audit fails
            }
          } else {
            result = [];
          }
          break;
        }
        case "lighthouse": {
          const config = vscode.workspace.getConfiguration("projectPulse");
          const apiKey = config.get<string>("lighthouseApiKey", "");
          result = await this._lighthouseService.runLighthouse(
            project.url,
            apiKey,
          );
          break;
        }
        default:
          this.postMessage({
            type: "checkError",
            projectId,
            check,
            error: `${check} check not yet implemented`,
          });
          return;
      }

      const updated = await this._projectService.updateLastCheck(
        projectId,
        check,
        result,
      );
      if (updated) {
        const newStatus = computeProjectStatus(updated);
        const final = await this._projectService.update(projectId, {
          status: newStatus,
        });
        if (final) {
          this.postMessage({ type: "projectUpdated", data: final });
          // Evaluate alerts
          const newAlerts = await this._alertService.evaluate(final);
          for (const alert of newAlerts) {
            this.postMessage({ type: "alert", data: alert });
          }
        }
      }

      this._storageService.appendHistory(projectId, {
        type: check,
        timestamp: new Date().toISOString(),
        data: result,
      });

      this.postMessage({ type: "checkResult", projectId, check, data: result });
    } catch (err: any) {
      this.postMessage({
        type: "checkError",
        projectId,
        check,
        error: err.message || "Check failed",
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, "dist", "webview.js"),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, "dist", "webview.css"),
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}; img-src ${webview.cspSource} data:;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>Project Pulse</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
