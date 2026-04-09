import type { ProjectPulsePanel } from "../WebviewProvider";
import { ProjectService } from "./ProjectService";
import { SSLService } from "./SSLService";
import { DNSService } from "./DNSService";
import { UptimeService } from "./UptimeService";
import { HeadersService } from "./HeadersService";
import { AlertService } from "./AlertService";
import { StorageService } from "./StorageService";
import { extractDomain } from "../utils/url";
import { computeProjectStatus } from "../utils/status";
import type { CheckType } from "../types/messages";

export class MonitoringScheduler {
  private _intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private _projectService: ProjectService,
    private _sslService: SSLService,
    private _dnsService: DNSService,
    private _uptimeService: UptimeService,
    private _headersService: HeadersService,
    private _alertService: AlertService,
    private _storageService: StorageService,
  ) {}

  startAll() {
    const projects = this._projectService.getAll();
    for (const project of projects) {
      this.startProject(project.id);
    }
  }

  startProject(projectId: string) {
    this.stopProject(projectId);
    const project = this._projectService.getById(projectId);
    if (!project) {
      return;
    }

    const intervalMs = project.monitoring.uptimeInterval * 60 * 1000;

    const interval = setInterval(async () => {
      await this._runChecksForProject(projectId);
    }, intervalMs);

    this._intervals.set(projectId, interval);
  }

  stopProject(projectId: string) {
    const interval = this._intervals.get(projectId);
    if (interval) {
      clearInterval(interval);
      this._intervals.delete(projectId);
    }
  }

  stopAll() {
    for (const [id, interval] of this._intervals) {
      clearInterval(interval);
    }
    this._intervals.clear();
  }

  async runChecksForProject(projectId: string) {
    await this._runChecksForProject(projectId);
  }

  private async _runChecksForProject(projectId: string) {
    const project = this._projectService.getById(projectId);
    if (!project) {
      return;
    }

    const domain = extractDomain(project.url);
    const checks: CheckType[] = [];

    if (project.monitoring.ssl) {
      checks.push("ssl");
    }
    if (project.monitoring.dns) {
      checks.push("dns");
    }
    if (project.monitoring.uptime) {
      checks.push("uptime");
    }
    if (project.monitoring.headers) {
      checks.push("headers");
    }

    for (const check of checks) {
      try {
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
        }

        if (result) {
          await this._projectService.updateLastCheck(projectId, check, result);
          this._storageService.appendHistory(projectId, {
            type: check,
            timestamp: new Date().toISOString(),
            data: result,
          });
        }
      } catch {
        // Log silently, don't break the check loop
      }
    }

    // Recompute status and evaluate alerts
    const updated = this._projectService.getById(projectId);
    if (updated) {
      const newStatus = computeProjectStatus(updated);
      await this._projectService.update(projectId, { status: newStatus });
      await this._alertService.evaluate(updated);
    }
  }
}
