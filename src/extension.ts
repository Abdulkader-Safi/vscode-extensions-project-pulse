import * as vscode from "vscode";
import { ProjectPulsePanel } from "./WebviewProvider";
import { ProjectService } from "./services/ProjectService";
import { SSLService } from "./services/SSLService";
import { DNSService } from "./services/DNSService";
import { UptimeService } from "./services/UptimeService";
import { HeadersService } from "./services/HeadersService";
import { AlertService } from "./services/AlertService";
import { StorageService } from "./services/StorageService";
import { MonitoringScheduler } from "./services/MonitoringScheduler";

let scheduler: MonitoringScheduler | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Initialize services
  const projectService = new ProjectService(context);
  const storageService = new StorageService();
  const alertService = new AlertService(context);

  // Create scheduler
  scheduler = new MonitoringScheduler(
    projectService,
    new SSLService(),
    new DNSService(),
    new UptimeService(),
    new HeadersService(),
    alertService,
    storageService,
  );

  // Start background monitoring
  scheduler.startAll();

  context.subscriptions.push(
    vscode.commands.registerCommand("project-pulse.openDashboard", () => {
      ProjectPulsePanel.createOrShow(context);
    }),
  );
}

export function deactivate() {
  if (scheduler) {
    scheduler.stopAll();
  }
}
